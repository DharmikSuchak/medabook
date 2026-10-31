const express = require('express');
const { DateTime } = require('luxon');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const redis = require('../utils/redisClient');

const router = express.Router();

// Cache TTL constants
const DOCTOR_LIST_TTL = 60;       // 60 seconds for doctor list
const DOCTOR_PROFILE_TTL = 120;   // 2 minutes for single profile

// Helper: invalidate doctor cache
const invalidateDoctorCache = async (doctorId) => {
  try {
    await redis.del(`doctor:${doctorId}`);
    // Also clear the doctor list cache (wildcard-style via scan)
    const keys = await redis.keys('doctors:list:*');
    if (keys.length) await redis.del(...keys);
  } catch (e) {
    console.error('Redis invalidation error:', e.message);
  }
};

// GET /api/doctors - list all doctors (filter by name/specialization)
// Cached in Redis for fast repeated lookups
router.get('/', protect, async (req, res) => {
  try {
    const { name, specialization } = req.query;
    const cacheKey = `doctors:list:${name || ''}:${specialization || ''}`;

    // Try Redis cache first
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const filter = { role: 'doctor' };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };

    const doctors = await User.find(filter).select('-__v');
    await redis.setex(cacheKey, DOCTOR_LIST_TTL, JSON.stringify(doctors)).catch(() => {});
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET/POST /api/doctors/seed - seed dummy doctors and slots
const handleSeed = async (req, res) => {
  try {
    const { seedDoctors } = require('../utils/seedDoctors');
    await seedDoctors(true);
    const count = await User.countDocuments({ role: 'doctor' });
    res.json({ message: 'Seeded dummy doctors successfully', totalDoctors: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
router.get('/seed', handleSeed);
router.post('/seed', handleSeed);

// GET /api/doctors/me - current doctor's own profile + schedule
router.get('/me', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/doctors/me/appointments - doctor sees their bookings
// Cached briefly in Redis to handle rapid dashboard refreshes
router.get('/me/appointments', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });

    const { status, from, to } = req.query;
    const cacheKey = `doctor:appts:${req.user._id}:${status || 'all'}:${from || ''}:${to || ''}`;

    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return res.json(JSON.parse(cached));

    const query = { doctor: req.user._id };
    if (status) query.status = status;
    if (from || to) {
      query.startUtc = {};
      if (from) query.startUtc.$gte = new Date(from);
      if (to)   query.startUtc.$lte = new Date(to);
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email timezone picture')
      .sort({ startUtc: 1 });

    await redis.setex(cacheKey, 30, JSON.stringify(appointments)).catch(() => {}); // 30s cache
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/doctors/:id - single doctor profile (cached)
router.get('/:id', protect, async (req, res) => {
  try {
    const cacheKey = `doctor:${req.params.id}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return res.json(JSON.parse(cached));

    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-__v');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await redis.setex(cacheKey, DOCTOR_PROFILE_TTL, JSON.stringify(doctor)).catch(() => {});
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/doctors/schedule - doctor updates working hours, appointment length, blocked periods
router.put('/schedule', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
    const { workingHours, appointmentLength, blockedPeriods, specialization, bio, timezone } = req.body;

    // Validate appointmentLength
    if (appointmentLength && ![15, 30, 60].includes(Number(appointmentLength))) {
      return res.status(400).json({ message: 'Appointment length must be 15, 30, or 60 minutes' });
    }

    // Validate timezone
    const VALID_TZ = ['Asia/Kolkata', 'Europe/London', 'America/New_York'];
    if (timezone && !VALID_TZ.includes(timezone)) {
      return res.status(400).json({ message: 'Invalid timezone' });
    }

    // Validate working hours time ranges
    if (workingHours) {
      for (const wh of workingHours) {
        for (const range of (wh.ranges || [])) {
          const start = DateTime.fromFormat(range.start, 'HH:mm');
          const end   = DateTime.fromFormat(range.end,   'HH:mm');
          if (!start.isValid || !end.isValid) {
            return res.status(400).json({ message: `Invalid time format in working hours: ${range.start} - ${range.end}` });
          }
          if (end <= start) {
            return res.status(400).json({ message: `End time must be after start time: ${range.start} - ${range.end}` });
          }
        }
      }
    }

    const updateFields = {};
    if (workingHours !== undefined)    updateFields.workingHours = workingHours;
    if (appointmentLength !== undefined) updateFields.appointmentLength = Number(appointmentLength);
    if (blockedPeriods !== undefined)  updateFields.blockedPeriods = blockedPeriods;
    if (specialization !== undefined)  updateFields.specialization = specialization;
    if (bio !== undefined)             updateFields.bio = bio;
    if (timezone !== undefined)        updateFields.timezone = timezone;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-__v');

    // Invalidate Redis cache for this doctor
    await invalidateDoctorCache(req.user._id.toString());

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/doctors/block - add a blocked period
router.post('/block', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
    const { start, end, reason, timezone } = req.body;

    if (!start || !end) return res.status(400).json({ message: 'start and end are required' });

    const doctor = await User.findById(req.user._id);
    const tz = timezone || doctor.timezone || 'Asia/Kolkata';

    // Parse start and end in doctor's active timezone, then convert to UTC
    const startDt = DateTime.fromISO(start, { zone: tz });
    const endDt   = DateTime.fromISO(end, { zone: tz });

    if (!startDt.isValid || !endDt.isValid) {
      return res.status(400).json({ message: 'Invalid start or end date format' });
    }

    const startUtc = startDt.toUTC().toJSDate();
    const endUtc   = endDt.toUTC().toJSDate();

    if (startUtc >= endUtc) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    doctor.blockedPeriods.push({ start: startUtc, end: endUtc, reason });
    await doctor.save();

    await invalidateDoctorCache(req.user._id.toString());
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/doctors/block/:blockId - remove a blocked period
router.delete('/block/:blockId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });

    const doctor = await User.findById(req.user._id);
    const idx = doctor.blockedPeriods.findIndex(b => b._id.toString() === req.params.blockId);
    if (idx === -1) return res.status(404).json({ message: 'Blocked period not found' });

    doctor.blockedPeriods.splice(idx, 1);
    await doctor.save();

    await invalidateDoctorCache(req.user._id.toString());
    res.json({ message: 'Blocked period removed', doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
