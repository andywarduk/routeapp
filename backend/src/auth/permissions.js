var permsEnum = {
  PERM_ADMIN: 'admin',
  PERM_VIEWROUTES: 'viewRoutes',
  PERM_MODIFYROUTES: 'modifyRoutes',
  PERM_CHECKALLROUTES: 'checkAllRoutes',
  PERM_DELETEROUTES: 'deleteRoutes'
}

var permsDesc = {
  PERM_ADMIN: 'Administrator',
  PERM_VIEWROUTES: 'View routes',
  PERM_MODIFYROUTES: 'Modify routes',
  PERM_CHECKALLROUTES: 'Check all routes',
  PERM_DELETEROUTES: 'Delete routes'
}

module.exports = {

  permsEnum,
  permsDesc,

  checkPermission: (...perm) => {
    return (req, res, next) => {
      var { user } = req
      var perms = user.perms || {}
      var ok = false

      if (perms[permsEnum.PERM_ADMIN]) {
        ok = true
      } else {
        for (p of perm) {
          if (perms[p]) {
            ok = true
            break
          }
        }
      }

      if (!ok) {
        res.status(401).send('Access denied')
      } else {
        next()
      }
    }
  },

}