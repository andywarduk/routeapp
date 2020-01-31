import { Request, Response, NextFunction } from "express"
import { IPerms } from "../models/userPerms"

export const permsDesc = {
  'admin': 'Administrator',
  'viewRoutes': 'View routes',
  'modifyRoutes': 'Modify routes',
  'checkAllRoutes': 'Check all routes',
  'deleteRoutes': 'Delete routes'
}

export const checkPermission = (...perm: (keyof IPerms)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let ok = false

    const { user } = req

    if (user) {
      const perms = user.perms || {}

      if (perms.admin) {
        ok = true
      } else {
        for (const p of perm) {
          if (perms[p]) {
            ok = true
            break
          }
        }
      }
    }

    if (!ok) {
      res.status(401).send('Access denied')
    } else {
      next()
    }
  }
}