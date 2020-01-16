var express = require('express')
var axios = require('axios')
var queryString = require('query-string')
var jwt = require('jsonwebtoken');

var response = require('../response')
var permissions = require('./permissions')
var { permsEnum } = permissions

// User schema
var Users = require('../models/users')

// Create router
var router = express.Router()

// Authenticate
router.route('/auth').post(async function (req, res) {
  try {
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

    // Set up user document
    var { id: athleteId, ...user } = data.athlete
    user.athleteid = athleteId
    user.auth = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      expires_in: data.expires_in
    }

    // Insert / update
    user = await Users.findOneAndUpdate({
      athleteid: athleteId
    }, user, {
      upsert: true,
      returnNewDocument: true
    })

    var update = false

    // Default permissions
    if (!user.perms) {
      user.perms = {}
      update = true
    }

    var hasPerms = false
    for (k of Object.keys(permsEnum)) {
      if (!!user.perms[permsEnum[k]]) {
        hasPerms = true
        break
      }
    }
    
    if (!hasPerms) {
      user.perms[permsEnum.PERM_VIEWROUTES] = true
      update = true
    }

    // Make app owner an admin
    var superAthlete = parseInt(process.env.SUPER_ATHLETE)
    if (!!superAthlete && athleteId === superAthlete) {
      user.perms[permsEnum.PERM_ADMIN] = true
      update = true
    }

    if (update) {
      // Update the user
      await user.save()
    }

    // Build jwt
    var jwtPayload = {
      athleteId
    }

    var token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      issuer: 'corsham.cc'
    })
    
    // Send back details
    res.json({
      jwt: token,
      picLarge: user.profile,
      picMed: user.profile_medium,
      firstName: user.firstname,
      lastName: user.lastname,
      fullName: `${user.firstname} ${user.lastname}`.trim(),
      perms: user.perms
    })

  } catch (err) {
    response.errorResponse(res, err)

  }

})

module.exports = router
