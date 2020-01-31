import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import stravaOAuth from '../strava/stravaOAuth';

// User schema
import Users from '../models/users';

export default () => {

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    issuer: 'corsham.cc'
  }, async (jwt_payload, done) => {
    // Try and load the user details
    try {
      // User document
      const user = await Users.findOne({
        athleteid: jwt_payload.athleteId
      })
        .populate('stravaUser')
        .populate('perms')
        .populate('auth')
        .exec()

      if (user) {
        // Check authentication
        const { auth } = user

        const secsLeft = auth.expires_at - Math.floor(new Date().getTime() / 1000)

        if (secsLeft <= 0) {
          const newAuth = await stravaOAuth.refreshToken(process.env.STRAVA_CLIENT_ID || '',
            process.env.STRAVA_CLIENT_SECRET || '', auth.refresh_token)

          auth.set({
            access_token: newAuth.access_token,
            refresh_token: newAuth.refresh_token,
            expires_at: newAuth.expires_at,
            expires_in: newAuth.expires_in
          })

          await auth.save()
        }
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
