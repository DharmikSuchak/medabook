const express = require('express');
const { DateTime } = require('luxon');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const redis = require('../utils/redisClient');

const router = express.Router();
const LOCK_TTL = parseInt(process.env.SLOT_LOCK_TTL) || 120; // seconds

// Helper: generate slot lock key
const slotKey = (doctorId, startUtc) => `lock:slot:${doctorId}:${new Date(startUtc).getTime()}`;

// POST /api/appointments - book an appointment
router.post('/', protect, requireRole('patient'), async (req, res) => {
  const { doctorId, startUtc } = req.body;
  const lockKey = slotKey(doctorId, startUtc);

  // Try to acquire Redis lock (NX = only set if not exists)
  const locked = await redis.set(lockKey, req.user._id.toString(), 'EX', LOCK_TTL, 'NX');
  if (!locked) {
    return res.status(409).json({ message: 'This slot is being booked by someone else. Please try another slot.' });
  }

  try {
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      await redis.del(lockKey);
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const start = new Date(startUtc);
    const end = new Date(start.getTime() + doctor.appointmentLength * 60000);

    // Check for conflicts (server-side enforcement)
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      status: 'confirmed',
      $or: [
        { startUtc: { $lt: end }, endUtc: { $gt: start } },
      ],
    });

    if (conflict) {
      await redis.del(lockKey);
      return res.status(409).json({ message: 'This slot is no longer available.' });
    }

    // Check idempotency - same patient same slot
    const duplicate = await Appointment.findOne({
      doctor: doctorId,
      patient: req.user._id,
      startUtc: start,
    });
    if (duplicate) {
      await redis.del(lockKey);
      return res.status(409).json({ message: 'You already have this appointment booked.' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      startUtc: start,
      endUtc: end,
      patientTimezone: req.user.timezone,
      history: [{ action: 'booked', by: req.user._id }],
    });

    await redis.del(lockKey);
    res.status(201).json(appointment);
  } catch (err) {
    await redis.del(lockKey);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments - list appointments for current user
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query = { patient: req.user._id };
    } else if (req.user.role === 'doctor') {
      query = { doctor: req.user._id };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email timezone')
      .populate('doctor', 'name specialization timezone')
      .sort({ startUtc: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/appointments/:id - cancel appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Ownership check
    const isOwner = appointment.patient.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: 'You cannot cancel this appointment' });

    // 2-hour cancellation rule
    const now = new Date();
    const twoHoursBefore = new Date(appointment.startUtc.getTime() - 2 * 60 * 60 * 1000);
    if (now >= twoHoursBefore) {
      return res.status(400).json({ message: 'Cancellations must be made at least 2 hours before the appointment.' });
    }

    appointment.status = 'cancelled';
    appointment.history.push({ action: 'cancelled', by: req.user._id });
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/appointments/:id/reschedule
router.put('/:id/reschedule', protect, requireRole('patient'), async (req, res) => {
  const { newStartUtc } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  if (appointment.patient.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not your appointment' });
  }

  const doctor = await User.findById(appointment.doctor);
  const newStart = new Date(newStartUtc);
  const newEnd = new Date(newStart.getTime() + doctor.appointmentLength * 60000);

  const lockKey = slotKey(appointment.doctor.toString(), newStartUtc);
  const locked = await redis.set(lockKey, req.user._id.toString(), 'EX', LOCK_TTL, 'NX');
  if (!locked) return res.status(409).json({ message: 'New slot is being booked by someone else.' });

  try {
    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      status: 'confirmed',
      _id: { $ne: appointment._id },
      $or: [{ startUtc: { $lt: newEnd }, endUtc: { $gt: newStart } }],
    });

    if (conflict) {
      await redis.del(lockKey);
      return res.status(409).json({ message: 'New slot is not available. Original appointment kept.' });
    }

    const oldStart = appointment.startUtc;
    appointment.history.push({ action: 'rescheduled', by: req.user._id, note: `From ${oldStart.toISOString()}` });
    appointment.startUtc = newStart;
    appointment.endUtc = newEnd;
    appointment.status = 'confirmed';
    await appointment.save();

    await redis.del(lockKey);
    res.json(appointment);
  } catch (err) {
    await redis.del(lockKey);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
