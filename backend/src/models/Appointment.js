const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startUtc: { type: Date, required: true },
    endUtc: { type: Date, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'rescheduled'],
      default: 'confirmed',
    },
    patientTimezone: {
      type: String,
      enum: ['Asia/Kolkata', 'Europe/London', 'America/New_York'],
      required: true,
    },
    history: [
      {
        action: { type: String, enum: ['booked', 'cancelled', 'rescheduled'] },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Prevent double-booking for the same doctor at overlapping times
appointmentSchema.index({ doctor: 1, startUtc: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
