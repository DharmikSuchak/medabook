const express = require('express')
const { checkJwt } = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

/**
 * POST /api/auth/sync
 * Called by the frontend after every Auth0 login.
 * Creates the user in our DB if they don't exist yet, or returns existing user.
 * Does NOT set a role — that happens separately.
 */
router.post('/sync', checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth?.payload?.sub
    const { name, email, picture, timezone } = req.body

    if (!auth0Id) return res.status(401).json({ message: 'Invalid token' })

    const VALID_TZ = ['Asia/Kolkata', 'Europe/London', 'America/New_York']
    const validTz  = VALID_TZ.includes(timezone) ? timezone : null

    let user = await User.findOne({ auth0Id })

    if (!user) {
      // First time this Auth0 user hits our backend — save detected timezone
      user = await User.create({ auth0Id, name, email, picture, ...(validTz && { timezone: validTz }) })
    } else {
      // Keep name/picture fresh from Auth0; auto-set timezone if not yet saved
      user.name    = name    || user.name
      user.picture = picture || user.picture
      if (validTz && !user.timezone) user.timezone = validTz
      await user.save()
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/**
 * POST /api/auth/set-role
 * Called once — when a new user picks their role on the RoleSelect screen.
 * Idempotent: returns existing user if role already set.
 */
router.post('/set-role', checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth?.payload?.sub
    const { role } = req.body

    if (!['doctor', 'patient'].includes(role)) {
      return res.status(400).json({ message: 'Role must be doctor or patient' })
    }

    const user = await User.findOne({ auth0Id })
    if (!user) return res.status(404).json({ message: 'User not found. Please log in again.' })

    // Do not allow role change after initial selection
    if (user.role) return res.json(user)

    user.role = role
    await user.save()

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/**
 * PUT /api/auth/profile
 * Lets any authenticated user update their timezone (and name/picture).
 */
router.put('/profile', checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth?.payload?.sub
    if (!auth0Id) return res.status(401).json({ message: 'Invalid token' })

    const VALID_TZ = ['Asia/Kolkata', 'Europe/London', 'America/New_York']
    const { timezone, name } = req.body

    if (timezone && !VALID_TZ.includes(timezone)) {
      return res.status(400).json({ message: 'Invalid timezone' })
    }

    const updateFields = {}
    if (timezone) updateFields.timezone = timezone
    if (name && name.trim()) updateFields.name = name.trim()

    const user = await User.findOneAndUpdate(
      { auth0Id },
      updateFields,
      { new: true, runValidators: true }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
