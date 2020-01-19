var passport = require('passport')
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt;

// User schema
var Users = require('../models/users')
var UserPerms = require('../models/userPerms')
var UserAuths = require('../models/userAuths')

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
