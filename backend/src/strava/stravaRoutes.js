const express = require('express')
const passport = require('passport')

const response = require('../response')
const permissions = require('../auth/permissions')
const { permsEnum } = permissions
const stravaApi = require('./stravaApi')

const router = express.Router()

// Get strava route
router.route('/strava/route/:id').get(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_MODIFYROUTES),
  async function (req, res) {
    try {
      const { access_token } = req.user.auth
      const { id } = req.params

      const route = await stravaApi.getRoute(access_token, id)

      res.json(route)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

module.exports = router
