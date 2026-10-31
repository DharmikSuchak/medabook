const { auth } = require('express-oauth2-jwt-bearer')
const User = require('../models/User')

// Verify Auth0 access token
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
})

// Attach our DB user to req.user after verifying the token
const protect = [
  checkJwt,
  async (req, res, next) => {
    try {
      const auth0Id = req.auth?.payload?.sub
      if (!auth0Id) return res.status(401).json({ message: 'Not authorised' })

      const user = await User.findOne({ auth0Id })
      if (!user) return res.status(401).json({ message: 'User not found. Please complete signup.' })

      req.user = user
      next()
    } catch (err) {
      res.status(401).json({ message: 'Token verification failed' })
    }
  },
]

const requireRole = (...roles) => [
  ...protect,
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for this role' })
    }
    next()
  },
]

module.exports = { protect, requireRole, checkJwt }
