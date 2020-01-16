var permsEnum = {
  PERM_ADMIN: 'admin',
  PERM_VIEWROUTES: 'viewRoutes',
  PERM_ADDROUTES: 'addRoutes',
  PERM_UPDATEROUTES: 'updateRoutes',
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
        res.send(401, 'Access denied')
      } else {
        next()
      }
    }
  }

}