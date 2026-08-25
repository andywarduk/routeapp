import express from 'express'
import passport from 'passport'
import { QueryFilter, QueryOptions } from 'mongoose'

import response from '../response'
import { checkPermission } from '../auth/permissions'

const router = express.Router()

// Routes schema
import Routes, { IRoutes } from '../models/routes'

export const regExEscape = (text: string) => {
  const specials = [
    '/', '.', '*', '+', '?', '|',
    '(', ')', '[', ']', '{', '}', '^', '$', '\\'
  ]

  const sRE = new RegExp(
    '(\\' + specials.join('|\\') + ')', 'g'
  )

  return text.replace(sRE, '\\$1');
}

interface Range {
  $gte?: number
  $lte?: number
}

/** Build a mongo range condition, or undefined when neither bound is set. */
export const rangeFilter = (from?: number, to?: number): Range | undefined => {
  const range: Range = {}

  if (from && from > 0) range.$gte = from
  if (to && to > 0) range.$lte = to

  return Object.keys(range).length > 0 ? range : undefined
}

export const buildPartialTextFilter = (filter: QueryFilter<IRoutes>, text: string) => {
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
  checkPermission('viewRoutes'),
  async function (req, res) {
    try {
      const searchOptions = req.body

      const filter: QueryFilter<IRoutes> = {}
      let options: QueryOptions<IRoutes> | undefined

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
        const distance = rangeFilter(srchFilter.distFrom, srchFilter.distTo)
        if (distance) filter.distance = distance

        // Elevation
        const elevation = rangeFilter(srchFilter.elevFrom, srchFilter.elevTo)
        if (elevation) filter.elevation_gain = elevation
      }

      // Projection
      let projection: Record<string, 1> | null = null

      if (searchOptions.columns) {
        const columns = searchOptions.columns

        if (Array.isArray(columns)) {
          projection = columns.reduce((acc: Record<string, 1>, cur: string) => {
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
  async function (_req, res) {
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
  checkPermission('viewRoutes'),
  async function (req, res) {
    try {
      const id = req.params.id;

      const doc = await Routes.findOne({
        routeid: parseInt(id)
      }).exec()

      if (doc) {
        res.json(doc)
      } else {
        response.errorMsgResponse(res, 404, 'Route not found')
      }

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Get route polyline
router.route('/routes/:id/polyLine').get(
  passport.authenticate('jwt', { session: false }),
  checkPermission('viewRoutes'),
  async function (req, res) {
    try {
      const id = req.params.id;

      const doc = await Routes.findOne({
        routeid: parseInt(id)
      }, {
        'map.polyline': 1
      }).exec()

      if (doc) {
        res.json(doc.map.polyline)
      } else {
        response.errorMsgResponse(res, 404, 'Route not found')
      }

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Get route summary polyline
router.route('/routes/:id/summaryPolyLine').get(
  passport.authenticate('jwt', { session: false }),
  checkPermission('viewRoutes'),
  async function (req, res) {
    try {
      const id = req.params.id;

      const doc = await Routes.findOne({
        routeid: parseInt(id)
      }, {
        'map.summary_polyline': 1
      }).exec()

      if (doc) {
        res.json(doc.map.summary_polyline)
      } else {
        response.errorMsgResponse(res, 404, 'Route not found')
      }

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Add or update route
router.route('/routes/:id').post(
  passport.authenticate('jwt', { session: false }),
  checkPermission('modifyRoutes'),
  async function (req, res) {
    const id = req.params.id

    const doc = {
      ...req.body,
      routeid: id
    }

    try {
      await Routes.replaceOne({
        routeid: parseInt(id)
      }, doc, {
        upsert: true
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
  checkPermission('modifyRoutes'),
  async function (req, res) {
    const id = req.params.id

    const doc = {
      ...req.body,
      routeid: id
    }

    try {
      await Routes.replaceOne({
        routeid: parseInt(id)
      }, doc).exec()

      response.msgResponse(res, `Replaced route ${id}`)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

// Delete route
router.route('/routes/:id').delete(
  passport.authenticate('jwt', { session: false }),
  checkPermission('deleteRoutes'),
  async function (req, res) {
    const id = req.params.id

    try {
      await Routes.findOneAndDelete({
        routeid: parseInt(id)
      }).exec()

      response.msgResponse(res, `Deleted route ${id}`)

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

export default router
