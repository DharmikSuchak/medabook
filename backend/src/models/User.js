const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true, index: true },
    name:    { type: String, required: true, trim: true },
    email:   { type: String, unique: true, lowercase: true, trim: true },
    picture: { type: String },
    role:    { type: String, enum: ['patient', 'doctor'], default: null },
    timezone: {
      type: String,
      enum: ['Asia/Kolkata', 'Europe/London', 'America/New_York'],
      default: 'Asia/Kolkata',
    },

    // Doctor-specific fields
    specialization: { type: String },
    bio:            { type: String },
    workingHours: [
      {
        day:    { type: Number, min: 0, max: 6 },  // 0 = Sunday
        ranges: [{ start: String, end: String }],   // local time "09:00" format
      },
    ],
    appointmentLength: { type: Number, enum: [15, 30, 60], default: 30 },
    blockedPeriods: [
      {
        start:  { type: Date },
        end:    { type: Date },
        reason: { type: String },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
