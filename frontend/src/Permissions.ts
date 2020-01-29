// Types

export interface IPermissionList {
  // TODO
  [propName: string]: boolean
}

export interface IPermissionKey {
  id: string
  desc: string
}

// Class definition

export default class Permissions
{
  perms: IPermissionList

  constructor(perms?: IPermissionList) {
    this.perms = perms || {}
  }

  check = (perm: string) => {
    let ok = false

    if (this.perms.admin || this.perms[perm]) ok = true

    return ok
  }

}