var permsEnum = {
  PERM_ADMIN: 'admin',
  PERM_VIEWROUTES: 'viewRoutes',
  PERM_MODIFYROUTES: 'modifyRoutes',
  PERM_CHECKALLROUTES: 'checkAllRoutes',
  PERM_DELETEROUTES: 'deleteRoutes'
}

module.exports = {

  permsEnum,

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
  }

}