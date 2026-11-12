import express from 'express'
import passport from 'passport'

import response from '../response'
import { checkPermission } from '../auth/permissions'
import stravaApi from './stravaApi'

const router = express.Router()

// Get strava route
router.route('/strava/route/:id').get(
  passport.authenticate('jwt', { session: false }),
  checkPermission('modifyRoutes'),
  async function (req, res) {
    try {
      if (!req.user || !req.user.auth) {
        response.errorMsgResponse(res, 401, 'Invalid user')

      } else {
        const { access_token } = req.user.auth
        const { id } = req.params

        if (!/^\d+$/.test(id)) {
          response.errorMsgResponse(res, 400, 'Invalid route id')
          return
        }

        const route = await stravaApi.getRoute(access_token, id)

        res.json(route)

      }

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

export default router
