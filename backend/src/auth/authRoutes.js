var express = require('express')
var passport = require('passport')
var axios = require('axios')
var queryString = require('query-string')
var jwt = require('jsonwebtoken');

var response = require('../response')
var permissions = require('./permissions')
var { permsEnum } = permissions

// User schemas
var StravaUsers = require('../models/stravaUsers')
var Users = require('../models/users')
var UserPerms = require('../models/userPerms')
var UserAuths = require('../models/userAuths')

// Create router
var router = express.Router()

// Authenticate
router.route('/auth').post(async function (req, res) {
  try {
    // Do strava authentication
    var body = {
      client_id: req.body.clientId,
      code: req.body.token,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'authorization_code'
    }

    var result = await axios.post('https://www.strava.com/oauth/token', queryString.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    var data = result.data

    // Set up strava user document
    var stravaUser = data.athlete

    // Always overwrite strava user with the new document
    stravaUser = await StravaUsers.findOneAndUpdate({
      id: stravaUser.id
    }, stravaUser, {
      upsert: true,
      overwrite: true,
      new: true
    }).exec()

    // Load user
    user = await Users.findOne({
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
      var superAthlete = parseInt(process.env.SUPER_ATHLETE)

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
    var jwtPayload = {
      athleteId: stravaUser.id
    }

    var token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
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
      var permKeys = []

      for (var k of Object.keys(permissions.permsEnum)) {
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
