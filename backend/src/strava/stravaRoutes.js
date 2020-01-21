var express = require('express')
var passport = require('passport')

var response = require('../response')
var permissions = require('../auth/permissions')
var { permsEnum } = permissions
var stravaApi = require('./stravaApi')

var router = express.Router()

// Get strava route
router.route('/strava/route/:id').get(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_MODIFYROUTES),
  async function (req, res) {
    try {
      var { access_token } = req.user.auth
      var { id } = req.params

      var route = await stravaApi.getRoute(access_token, id)

      res.json(route)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

module.exports = router
