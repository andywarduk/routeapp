var express = require('express')
var passport = require('passport')

var response = require('../response')
var permissions = require('../auth/permissions')
var { permsEnum } = permissions

var router = express.Router()

// Routes schema
var Routes = require('../models/routes')

regExEscape = (text) => {
  var specials = [
    '/', '.', '*', '+', '?', '|',
    '(', ')', '[', ']', '{', '}', '\\'
  ]

  var sRE = new RegExp(
    '(\\' + specials.join('|\\') + ')', 'g'
  )

  return text.replace(sRE, '\\$1');
}

buildPartialTextFilter = (filter, text) => {
  var words = text.split(" ").map(regExEscape).filter((x) => x !== '')

  var andClause = []

  for (word of words) {
    var orClause = []

    orClause.push({name: new RegExp('^' + word, 'i')})
    orClause.push({name: new RegExp(' ' + word, 'i')})
    orClause.push({description: new RegExp('^' + word, 'i')})
    orClause.push({description: new RegExp(' ' + word, 'i')})

    andClause.push({
      $or: orClause
    })
  }

  filter.$and = andClause
}

// Search routes
router.route('/routes').post(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_VIEWROUTES),
  async function (req, res) {
    try {
      var searchOptions = req.body

      var filter = {}
      var options = null

      // Filter
      if (searchOptions.filter) {
        var srchFilter = searchOptions.filter

        // Text
        if (srchFilter.srchText && srchFilter.srchText != '') {
          if (!!srchFilter.partialWord) {
            buildPartialTextFilter(filter, srchFilter.srchText)
          } else {
            filter.$text = {
              $search: srchFilter.srchText
            }
          }
        }

        // Distance
        if (srchFilter.distFrom && srchFilter.distFrom > 0) {
          filter.distance = {
            ...filter.distance,
            $gte: srchFilter.distFrom
          }
        }

        if (srchFilter.distTo && srchFilter.distTo > 0) {
          filter.distance = {
            ...filter.distance,
            $lte: srchFilter.distTo
          }
        }

        // Elevation
        if (srchFilter.elevFrom && srchFilter.elevFrom > 0) {
          filter.elevation_gain = {
            ...filter.elevation_gain,
            $gte: srchFilter.elevFrom
          }
        }

        if (srchFilter.elevTo && srchFilter.elevTo > 0) {
          filter.elevation_gain = {
            ...filter.elevation_gain,
            $lte: srchFilter.elevTo
          }
        }
      }

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

      // Sort
      if (searchOptions.sort) {
        options = options || {}

        var col = searchOptions.sort.column
        var order = searchOptions.sort.ascending ? 1 : -1

        options.sort = {
          [col]: order
        }
      }

      // Do search
      var routes = await Routes.find(filter, projection, options).exec()

      // Return JSON document
      res.json(routes)

    } catch(err) {
      response.errorResponse(res, err)

    }
  }
)

// Get route list
router.route('/routes/list').get(
  async function (req, res) {
    try {
      // Do search
      var list = await Routes.find({}, {
        routeid: 1
      }, {
        sort: {
          routeid: 1
        }
      }).exec()

      res.send(list.map((r) => r.routeid).join('\n') + '\n')

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Get specific route
router.route('/routes/:id').get(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_VIEWROUTES),
  async function (req, res) {
    try {
      var id = req.params.id;

      var doc = await Routes.findOne({
        routeid: id
      }).exec()

      res.json(doc)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Add or update route
router.route('/routes/:id').post(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_MODIFYROUTES),
  async function (req, res) {
    var id = req.params.id

    var doc = {
      ...req.body,
      routeid: id
    }

    try {
      await Routes.findOneAndUpdate({
        routeid: id
      }, doc, {
        upsert: true,
        overwrite: true
      }).exec()

      response.msgResponse(res, `Added / replaced route ${id}`)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Replace route
router.route('/routes/:id').put(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_MODIFYROUTES),
  async function (req, res) {
    var id = req.params.id

    var doc = {
      ...req.body,
      routeid: id
    }

    try {
      await Routes.findOneAndUpdate({
        routeid: id
      }, doc, {
        overwrite: true
      }).exec()

      response.msgResponse(res, `Replaced route ${id}`)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Delete route
router.route('/routes/:id').delete(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_DELETEROUTES),
  async function (req, res) {
    var id = req.params.id

    try {
      await Routes.findOneAndRemove({
        routeid: id
      }).exec()

      response.msgResponse(res, `Deleted route ${id}`)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

module.exports = router
