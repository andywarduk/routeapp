var express = require('express')
var passport = require('passport')
var axios = require('axios')

var response = require('../response')
var permissions = require('../auth/permissions')
var { permsEnum } = permissions

var router = express.Router()

// Get strava route
router.route('/strava/route/:id').get(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_UPDATEROUTES, permsEnum.PERM_ADDROUTES),
  async function (req, res) {
    var id = req.params.id

    try {
      var { access_token } = req.user.auth

      var result = await axios.get(`https://www.strava.com/api/v3/routes/${id}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })

      res.json(result.data)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

module.exports = router
