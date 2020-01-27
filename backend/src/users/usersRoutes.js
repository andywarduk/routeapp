var express = require('express')
var passport = require('passport')

var response = require('../response')
var permissions = require('../auth/permissions')
var { permsEnum } = permissions

var router = express.Router()

// Users schema
var Users = require('../models/users')
var UserPerms = require('../models/userPerms')

// Get users
router.route('/users').post(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_ADMIN),
  async function (req, res) {
    try {
      var searchOptions = req.body

      // Projection
      var projection = null

      if (searchOptions.columns) {
        var columns = searchOptions.columns

        if (Array.isArray(columns)) {
          projection = columns.reduce((acc, cur) => {
            acc[cur] = 1
            return acc
          }, {})
        }
      }

      // Do search
      var users = Users.find({}, projection)
        .populate('stravaUser')

      if (searchOptions.perms === true) {
        users = users.populate('perms')
      }

      users = await users.exec()

      // Sort
      if (searchOptions.sort) {
        var col = searchOptions.sort.column
        var order = searchOptions.sort.ascending ? 1 : -1

        var compareCol = (a, b, cols) => {
          var thisCol = cols[cols.length - 1]
          if (a.stravaUser[thisCol] === b.stravaUser[thisCol]) {
            switch (thisCol) {
            case 'lastname':
              if (cols[cols.length - 2] !== 'firstname') {
                cols.push('firstname')
                return compareCol(a, b, cols)
              }
              break
            case 'firstname':
              if (cols[cols.length - 2] !== 'lastname') {
                cols.push('lastname')
                return compareCol(a, b, cols)
              }
              break
            }

            return compareCol(a, b, ['id'])
          }

          return (a.stravaUser[col] < b.stravaUser[col] ? -1 : 1) * order
        }

        users.sort((a, b) => compareCol(a, b, [col]))
      }

      // Return JSON document
      res.json(users)

    } catch(err) {
      response.errorResponse(res, err)

    }
  }
)

// Get specific user
router.route('/users/:id').get(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_ADMIN),
  async function (req, res) {
    try {
      var id = req.params.id;

      var doc = await Users.findOne({
        athleteid: id
      })
        .populate('stravaUser')
        .populate('perms')
        .exec()

      res.json(doc)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Set user permissions
router.route('/users/:id/perms').put(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_ADMIN),
  async function (req, res) {
    try {
      var id = req.params.id;

      // Load user
      var user = await Users.findOne({
        athleteid: id
      }).exec()

      // Update permissions
      perms = {
        user: user._id,
        ...req.body
      }

      await UserPerms.findByIdAndUpdate(user.perms, perms, {
        upsert: true,
        overwrite: true,
        new: true
      }).exec()

      response.msgResponse(res, `Replaced permissions for athlete ${id}`)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

module.exports = router
