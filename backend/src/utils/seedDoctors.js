const User = require('../models/User')

const DUMMY_DOCTORS = [
  {
    auth0Id: 'seed|doctor_aarav_patel',
    name: 'Dr. Aarav Patel',
    email: 'dr.aarav.patel@medabook.com',
    picture: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    role: 'doctor',
    timezone: 'Asia/Kolkata',
    specialization: 'Cardiologist',
    bio: 'Senior Consultant Interventional Cardiologist with 14+ years of clinical experience in coronary angiography, hypertension care, and preventive cardiology.',
    appointmentLength: 30,
    workingHours: [
      { day: 1, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, // Mon
      { day: 2, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, // Tue
      { day: 3, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, // Wed
      { day: 4, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, // Thu
      { day: 5, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] }, // Fri
      { day: 6, ranges: [{ start: '10:00', end: '14:00' }] },                                      // Sat
    ],
    blockedPeriods: [
      {
        start: new Date(Date.now() + 86400000 * 2), // 2 days from now
        end: new Date(Date.now() + 86400000 * 2 + 3600000 * 2),
        reason: 'Hospital Clinical Audit',
      },
    ],
  },
  {
    auth0Id: 'seed|doctor_sarah_jenkins',
    name: 'Dr. Sarah Jenkins',
    email: 'dr.sarah.jenkins@medabook.com',
    picture: 'https://images.unsplash.com/photo-1594824813583-29a3a1f100bb?w=400&auto=format&fit=crop&q=80',
    role: 'doctor',
    timezone: 'Europe/London',
    specialization: 'Neurologist',
    bio: 'Consultant Neurologist at London Neurological Institute. Specializing in migraine therapeutics, epilepsy monitoring, and cognitive neurology.',
    appointmentLength: 30,
    workingHours: [
      { day: 1, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:30' }] },
      { day: 2, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:30' }] },
      { day: 3, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:30' }] },
      { day: 4, ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:30' }] },
      { day: 5, ranges: [{ start: '09:00', end: '13:30' }] },
    ],
    blockedPeriods: [],
  },
  {
    auth0Id: 'seed|doctor_marcus_vance',
    name: 'Dr. Marcus Vance',
    email: 'dr.marcus.vance@medabook.com',
    picture: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    role: 'doctor',
    timezone: 'America/New_York',
    specialization: 'Orthopedic Surgeon',
    bio: 'Board-certified orthopedic surgeon focusing on sports medicine, joint arthroplasty, and minimally invasive reconstructive surgery.',
    appointmentLength: 30,
    workingHours: [
      { day: 1, ranges: [{ start: '08:30', end: '12:30' }, { start: '13:30', end: '17:00' }] },
      { day: 2, ranges: [{ start: '08:30', end: '12:30' }, { start: '13:30', end: '17:00' }] },
      { day: 3, ranges: [{ start: '08:30', end: '12:30' }, { start: '13:30', end: '17:00' }] },
      { day: 4, ranges: [{ start: '08:30', end: '12:30' }, { start: '13:30', end: '17:00' }] },
      { day: 5, ranges: [{ start: '08:30', end: '13:00' }] },
    ],
    blockedPeriods: [],
  },
  {
    auth0Id: 'seed|doctor_priya_sharma',
    name: 'Dr. Priya Sharma',
    email: 'dr.priya.sharma@medabook.com',
    picture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    role: 'doctor',
    timezone: 'Asia/Kolkata',
    specialization: 'Pediatrician',
    bio: 'Compassionate pediatrician dedicated to newborn developmental milestones, adolescent healthcare, and pediatric infectious disease management.',
    appointmentLength: 15,
    workingHours: [
      { day: 1, ranges: [{ start: '09:30', end: '13:30' }, { start: '16:00', end: '19:30' }] },
      { day: 2, ranges: [{ start: '09:30', end: '13:30' }, { start: '16:00', end: '19:30' }] },
      { day: 3, ranges: [{ start: '09:30', end: '13:30' }, { start: '16:00', end: '19:30' }] },
      { day: 4, ranges: [{ start: '09:30', end: '13:30' }, { start: '16:00', end: '19:30' }] },
      { day: 5, ranges: [{ start: '09:30', end: '13:30' }, { start: '16:00', end: '19:30' }] },
      { day: 6, ranges: [{ start: '10:00', end: '14:00' }] },
    ],
    blockedPeriods: [],
  },
  {
    auth0Id: 'seed|doctor_james_oliver',
    name: 'Dr. James Oliver',
    email: 'dr.james.oliver@medabook.com',
    picture: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    role: 'doctor',
    timezone: 'Europe/London',
    specialization: 'Dermatologist',
    bio: 'Specialist in inflammatory dermatoses, clinical acne management, dermoscopy, and pediatric skin conditions.',
    appointmentLength: 30,
    workingHours: [
      { day: 1, ranges: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { day: 3, ranges: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { day: 4, ranges: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
      { day: 5, ranges: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '17:00' }] },
    ],
    blockedPeriods: [],
  },
  {
    auth0Id: 'seed|doctor_elena_rostova',
    name: 'Dr. Elena Rostova',
    email: 'dr.elena.rostova@medabook.com',
    picture: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&auto=format&fit=crop&q=80',
    role: 'doctor',
    timezone: 'America/New_York',
    specialization: 'Psychiatrist',
    bio: 'Adult psychotherapist and psychiatrist focusing on anxiety disorders, depression management, trauma-informed care, and cognitive wellness.',
    appointmentLength: 60,
    workingHours: [
      { day: 1, ranges: [{ start: '10:00', end: '14:00' }, { start: '15:00', end: '19:00' }] },
      { day: 2, ranges: [{ start: '10:00', end: '14:00' }, { start: '15:00', end: '19:00' }] },
      { day: 3, ranges: [{ start: '10:00', end: '14:00' }, { start: '15:00', end: '19:00' }] },
      { day: 4, ranges: [{ start: '10:00', end: '14:00' }, { start: '15:00', end: '19:00' }] },
      { day: 5, ranges: [{ start: '10:00', end: '14:00' }, { start: '15:00', end: '18:00' }] },
    ],
    blockedPeriods: [],
  },
]

async function seedDoctors(force = false) {
  try {
    const existingCount = await User.countDocuments({ role: 'doctor' })
    if (existingCount >= 6 && !force) {
      console.log(`[Seed] Already ${existingCount} doctors in DB, skipping seed.`)
      return
    }

    console.log('[Seed] Seeding dummy doctors with full working hours and slots...')
    for (const doc of DUMMY_DOCTORS) {
      await User.findOneAndUpdate(
        { auth0Id: doc.auth0Id },
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    }

    // Also: if any existing real doctor has no workingHours set, give them default working hours
    const realDoctors = await User.find({ role: 'doctor', auth0Id: { $not: /^seed\|/ } })
    for (const doc of realDoctors) {
      if (!doc.workingHours || doc.workingHours.length === 0) {
        doc.workingHours = [1, 2, 3, 4, 5].map((d) => ({
          day: d,
          ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '17:00' }],
        }))
        if (!doc.specialization) doc.specialization = 'General Practitioner'
        if (!doc.bio) doc.bio = 'Available for telehealth and in-person consultations.'
        if (!doc.appointmentLength) doc.appointmentLength = 30
        await doc.save()
        console.log(`[Seed] Initialized working hours for real doctor: ${doc.name}`)
      }
    }

    console.log(`[Seed] Successfully seeded ${DUMMY_DOCTORS.length} doctors.`)
  } catch (err) {
    console.error('[Seed] Error seeding doctors:', err.message)
  }
}

module.exports = { seedDoctors, DUMMY_DOCTORS }
