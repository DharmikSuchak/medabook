const express = require('express');
const { DateTime } = require('luxon');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/slots?doctorId=...&date=2024-12-25&timezone=Asia/Kolkata
router.get('/', protect, async (req, res) => {
  try {
    const { doctorId, date, timezone } = req.query;
    if (!doctorId || !date || !timezone) {
      return res.status(400).json({ message: 'doctorId, date, and timezone are required' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Parse date in doctor's timezone, find working hours for day of week
    const requestedDay = DateTime.fromISO(date, { zone: doctor.timezone });
    const dayOfWeek = requestedDay.weekday % 7; // 0=Sunday

    const daySchedule = doctor.workingHours.find((d) => d.day === dayOfWeek);
    if (!daySchedule || !daySchedule.ranges.length) {
      return res.json({ slots: [], message: 'Doctor not available on this day' });
    }

    const slots = [];
    const slotDuration = doctor.appointmentLength;

    for (const range of daySchedule.ranges) {
      const [startH, startM] = range.start.split(':').map(Number);
      const [endH, endM] = range.end.split(':').map(Number);

      let current = requestedDay.set({ hour: startH, minute: startM, second: 0, millisecond: 0 });
      const rangeEnd = requestedDay.set({ hour: endH, minute: endM, second: 0, millisecond: 0 });

      while (current.plus({ minutes: slotDuration }) <= rangeEnd) {
        const slotStart = current.toUTC();
        const slotEnd = current.plus({ minutes: slotDuration }).toUTC();

        // Check if past
        if (slotStart > DateTime.utc()) {
          // Check blocked periods
          const blocked = doctor.blockedPeriods.some(
            (b) => new Date(b.start) < slotEnd.toJSDate() && new Date(b.end) > slotStart.toJSDate()
          );

          if (!blocked) {
            // Check existing bookings
            const booked = await Appointment.findOne({
              doctor: doctorId,
              status: 'confirmed',
              startUtc: { $lt: slotEnd.toJSDate() },
              endUtc: { $gt: slotStart.toJSDate() },
            });

            if (!booked) {
              const patientTz = DateTime.fromISO(slotStart.toISO(), { zone: timezone });
              slots.push({
                startUtc: slotStart.toISO(),
                endUtc: slotEnd.toISO(),
                displayLocal: patientTz.toFormat('h:mm a'),
                displayDoctor: current.toFormat('h:mm a'),
              });
            }
          }
        }

        current = current.plus({ minutes: slotDuration });
      }
    }

    res.json({ slots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
