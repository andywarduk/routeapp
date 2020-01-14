var passport = require('passport')
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt;

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
      var user = await Users.findOne({
        athleteid: jwt_payload.athleteId
      })

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
