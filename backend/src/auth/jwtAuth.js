var passport = require('passport')
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt;

var stravaOAuth = require('../strava/stravaOAuth')

// User schema
var Users = require('../models/users')

module.exports = () => {

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    issuer: 'corsham.cc'
  }, async (jwt_payload, done) => {
    // Try and load the user details
    try {
      // User document
      var user = await Users.findOne({
        athleteid: jwt_payload.athleteId
      })
        .populate('stravaUser')
        .populate('perms')
        .populate('auth')
        .exec()

      // Check authentication
      var { auth } = user

      var secsLeft = auth.expires_at - Math.floor(new Date().getTime() / 1000)

      if (true || secsLeft <= 0) {
        var newAuth = await stravaOAuth.refreshToken(process.env.STRAVA_CLIENT_ID, process.env.STRAVA_CLIENT_SECRET, auth.refresh_token)

        auth.set({
          access_token: newAuth.access_token,
          refresh_token: newAuth.refresh_token,
          expires_at: newAuth.expires_at,
          expires_in: newAuth.expires_in
        })

        await auth.save()
      }

      if (user) {
        // Got the user
        done(null, user)
      } else {
        // No user
        done(null, false)
      }

    } catch(err) {
      // Failed
      done(err, false)

    }

  }))

}
