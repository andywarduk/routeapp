const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken');

const response = require('../response')
const permissions = require('../auth/permissions')
const { permsEnum } = permissions
const stravaOAuth = require('../strava/stravaOAuth')

// User schemas
const StravaUsers = require('../models/stravaUsers')
const Users = require('../models/users')
const UserPerms = require('../models/userPerms')
const UserAuths = require('../models/userAuths')

// Create router
const router = express.Router()

// Authenticate
router.route('/auth').post(async function (req, res) {
  try {
    // Do strava authentication
    const data = await stravaOAuth.tokenExchange(req.body.clientId, req.body.token, process.env.STRAVA_CLIENT_SECRET)

    // Set up strava user document
    let stravaUser = data.athlete

    // Always overwrite strava user with the new document
    stravaUser = await StravaUsers.findOneAndUpdate({
      id: stravaUser.id
    }, stravaUser, {
      upsert: true,
      overwrite: true,
      new: true
    }).exec()

    // Load user
    let user = await Users.findOne({
      athleteid: stravaUser.id
    })
      .populate('perms')
      .populate('auth')
      .exec()

    if (!user) {
      // User does not exist
      user = new Users({
        athleteid: stravaUser.id,
        stravaUser: stravaUser._id
      })
    }

    if (!user.perms) {
      // Create perms
      user.perms = new UserPerms({
        user: user._id
      })

      // Make app owner an admin, all others get viewRoutes by default
      const superAthlete = parseInt(process.env.SUPER_ATHLETE)

      if (!!superAthlete && stravaUser.id === superAthlete) {
        user.perms[permsEnum.PERM_ADMIN] = true
      } else {
        user.perms[permsEnum.PERM_VIEWROUTES] = true
      }

      await user.perms.save()
    }

    if (!user.auth) {
      // Create auth
      user.auth = new UserAuths({
        user: user._id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        expires_in: data.expires_in
      })

    } else {
      // Set auth details
      user.auth.access_token = data.access_token
      user.auth.refresh_token = data.refresh_token
      user.auth.expires_at = data.expires_at
      user.auth.expires_in = data.expires_in

    }

    // Save auth
    await user.auth.save()

    // Save user row 
    await user.save()

    // Build jwt
    const jwtPayload = {
      athleteId: stravaUser.id
    }

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      issuer: 'corsham.cc'
    })

    // Send back details
    res.json({
      jwt: token,
      picLarge: stravaUser.profile,
      picMed: stravaUser.profile_medium,
      fullName: `${stravaUser.firstname} ${stravaUser.lastname}`.trim(),
      perms: user.perms
    })

  } catch (err) {
    response.errorResponse(res, err)

  }

})

// Get available permissions
router.route('/auth/permkeys').get(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_ADMIN),
  async function (req, res) {
    try {
      const permKeys = []

      for (const k of Object.keys(permissions.permsEnum)) {
        permKeys.push({
          id: permissions.permsEnum[k],
          desc: permissions.permsDesc[k]
        })
      }

      res.json(permKeys)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

module.exports = router
