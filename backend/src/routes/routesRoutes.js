var express = require('express')
var passport = require('passport')

var response = require('../response')

var router = express.Router()

// Routes schema
var Routes = require('../models/routes')

// Get specific route
router.route('/routes/:id').get(async function (req, res) {
  try {
    var id = req.params.id;

    var doc = await Routes.findOne({
      routeid: id
    })

    res.json(doc)

  } catch (err) {
    response.errorResponse(res, err)

  }
})

// Get all routes
router.route('/routes').get(async function (req, res) {
  try {
    var routes = await Routes.find()

    res.json(routes)

  } catch(err) {
    response.errorResponse(res, err)

  }
})

// Get routes
router.route('/routes').post(async function (req, res) {
  try {
    var searchOptions = req.body

    var filter = {}
    var options = null

    // Filter
    if (searchOptions.filter) {
      var srchFilter = searchOptions.filter

      // Text
      if (srchFilter.srchText && srchFilter.srchText != '') {
        filter.$text = {
          $search: srchFilter.srchText
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
    var routes = await Routes.find(filter, projection, options)

    // Return JSON document
    res.json(routes)

  } catch(err) {
    response.errorResponse(res, err)

  }
})

// Add route
router.route('/routes/add/:id').post(passport.authenticate('jwt', { session: false }), async function (req, res) {
  var id = req.params.id

  var doc = {
    ...req.body,
    routeid: id
  }

  var item = new Routes(doc);

  try {
    await item.save()

    response.msgResponse(res, `Saved route ${id}`)

  } catch (err) {
    response.errorResponse(res, err)

  }

})

// Replace route
router.route('/routes/replace/:id').put(passport.authenticate('jwt', { session: false }), async function (req, res) {
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
    })

    response.msgResponse(res, `Replaced route ${id}`)

  } catch (err) {
    response.errorResponse(res, err)

  }

})

// Delete route
router.route('/routes/delete/:id').delete(passport.authenticate('jwt', { session: false }), async function (req, res) {
  var id = req.params.id

  try {
    await Routes.findOneAndRemove({
      routeid: id
    })

    response.msgResponse(res, `Deleted route ${id}`)

  } catch (err) {
    response.errorResponse(res, err)

  }

})

module.exports = router
