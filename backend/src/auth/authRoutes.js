var express = require('express')
var axios = require('axios')
var queryString = require('query-string')
var jwt = require('jsonwebtoken');

var response = require('../response')
var permissions = require('./permissions')
var { permsEnum } = permissions

// User schemas
var Users = require('../models/users')
var UserPerms = require('../models/userPerms')
var UserAuth = require('../models/userAuth')

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

    user = await Users.findOneAndUpdate({
      athleteid: athleteId
    }, user, {
      upsert: true,
      overwrite: true,
      returnNewDocument: true
    }).exec()
    
    // Save the user auth document
    await UserAuth.findOneAndUpdate({
      athleteid: athleteId
    }, {
      athleteid: athleteId,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      expires_in: data.expires_in
    }, {
      upsert: true,
      overwrite: true,
      returnNewDocument: true
    }).exec()

    // Look up permissions
    var perms = await UserPerms.findOne({
      athleteid: athleteId
    }).exec()

    var save = false

    if (!perms) {
      // Create perms document
      perms = new UserPerms()

      perms.athleteid = athleteId
      perms.perms = {
        [permsEnum.PERM_VIEWROUTES]: true
      }

      save = true
    }

    // Make app owner an admin
    var superAthlete = parseInt(process.env.SUPER_ATHLETE)

    if (!!superAthlete && athleteId === superAthlete && !perms.perms[permsEnum.PERM_ADMIN]) {
      perms.perms[permsEnum.PERM_ADMIN] = true
      save = true
    }
    
    if (save) {
      await perms.save()
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
      fullName: `${user.firstname} ${user.lastname}`.trim(),
      perms: perms.perms
    })

  } catch (err) {
    response.errorResponse(res, err)

  }

})

module.exports = router
