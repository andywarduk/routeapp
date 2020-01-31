import express from 'express'
import passport from 'passport'

import response from '../response'
import { checkPermission } from '../auth/permissions'

const router = express.Router()

// Users schema
import Users, { IUserModel } from '../models/users'
import UserPerms from '../models/userPerms'
import { IStravaUserModel } from '../models/stravaUsers'

// Get users
router.route('/users').post(
  passport.authenticate('jwt', { session: false }),
  checkPermission('admin'),
  async function (req, res) {
    try {
      const searchOptions = req.body

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

      // Do search
      let usersQuery = Users.find({}, projection)
        .populate('stravaUser')

      if (searchOptions.perms === true) {
        usersQuery = usersQuery.populate('perms')
      }

      const users = await usersQuery.exec()

      // Sort
      if (searchOptions.sort) {
        const col = searchOptions.sort.column
        const order = searchOptions.sort.ascending ? 1 : -1

        const compareCol = (a: IUserModel, b: IUserModel, cols: (keyof IStravaUserModel)[]): number => {
          const thisCol: keyof IStravaUserModel = cols[cols.length - 1]

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

          return (a.stravaUser[thisCol] < b.stravaUser[thisCol] ? -1 : 1) * order
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
  checkPermission('admin'),
  async function (req, res) {
    try {
      const id = req.params.id;

      const doc = await Users.findOne({
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
  checkPermission('admin'),
  async function (req, res) {
    try {
      const id = req.params.id;

      // Load user
      const user = await Users.findOne({
        athleteid: id
      }).exec()

      if (!user) {
        response.errorMsgResponse(res, 404, 'User not found')

      } else {
        // Update permissions
        const perms = {
          user: user._id,
          ...req.body
        }

        await UserPerms.findByIdAndUpdate(user.perms, perms, {
          upsert: true,
          overwrite: true,
          new: true
        }).exec()

        response.msgResponse(res, `Replaced permissions for athlete ${id}`)
      }

    } catch (err) {
      response.errorResponse(res, err)

    }
  }
)

export default router
