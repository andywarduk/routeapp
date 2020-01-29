const express = require('express')
const passport = require('passport')

const response = require('../response')
const permissions = require('../auth/permissions')
const { permsEnum } = permissions

const router = express.Router()

// Routes schema
const Routes = require('../models/routes')

const regExEscape = (text) => {
  const specials = [
    '/', '.', '*', '+', '?', '|',
    '(', ')', '[', ']', '{', '}', '\\'
  ]

  const sRE = new RegExp(
    '(\\' + specials.join('|\\') + ')', 'g'
  )

  return text.replace(sRE, '\\$1');
}

const buildPartialTextFilter = (filter, text) => {
  const words = text.split(" ").map(regExEscape).filter((x) => x !== '')

  const andClause = []

  for (const word of words) {
    const orClause = []

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
      const searchOptions = req.body

      const filter = {}
      let options = null

      // Filter
      if (searchOptions.filter) {
        const srchFilter = searchOptions.filter

        // Text
        if (srchFilter.srchText && srchFilter.srchText != '') {
          if (srchFilter.partialWord) {
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
      let projection = null

      if (searchOptions.columns) {
        const columns = searchOptions.columns

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

        const col = searchOptions.sort.column
        const order = searchOptions.sort.ascending ? 1 : -1

        options.sort = {
          [col]: order
        }
      }

      // Do search
      const routes = await Routes.find(filter, projection, options).exec()

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
      const list = await Routes.find({}, {
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
      const id = req.params.id;

      const doc = await Routes.findOne({
        routeid: id
      }).exec()

      res.json(doc)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Get route polyline
router.route('/routes/:id/polyLine').get(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_VIEWROUTES),
  async function (req, res) {
    try {
      const id = req.params.id;

      const doc = await Routes.findOne({
        routeid: id
      }, {
        'map.polyline': 1
      }).exec()

      res.json(doc.map.polyline)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Get route summary polyline
router.route('/routes/:id/summaryPolyLine').get(
  passport.authenticate('jwt', { session: false }),
  permissions.checkPermission(permsEnum.PERM_VIEWROUTES),
  async function (req, res) {
    try {
      const id = req.params.id;

      const doc = await Routes.findOne({
        routeid: id
      }, {
        'map.summary_polyline': 1
      }).exec()

      res.json(doc.map.summary_polyline)

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
    const id = req.params.id

    const doc = {
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
    const id = req.params.id

    const doc = {
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
    const id = req.params.id

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
