var express = require('express')
var axios = require('axios')
var queryString = require('query-string')
var jwt = require('jsonwebtoken');

var response = require('../response')

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
    await Users.findOneAndUpdate({
      athleteid: athleteId
    }, user, {
      upsert: true
    })

    // Build jwt
    var jwtPayload = {
      athleteId
    }

    var token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      issuer: 'corsham.cc'
    })
    
    // Send back
    res.json(token)

  } catch (err) {
    response.errorResponse(res, err)

  }

})

module.exports = router
