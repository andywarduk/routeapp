var passport = require('passport')
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt;

// User schema
var Users = require('../models/users')
var UserPerms = require('../models/userPerms')
var UserAuth = require('../models/userAuth')

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
      }).exec()

      if (user) {
        // Auth
        var auth = await UserAuth.findOne({
          athleteid: jwt_payload.athleteId
        }).exec()

        if (auth) user.auth = auth
        else user.auth = {}

        // Permissions
        var perms = await UserPerms.findOne({
          athleteid: jwt_payload.athleteId
        }).exec()

        if (perms) user.perms = perms.perms
        else user.perms = {}
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
