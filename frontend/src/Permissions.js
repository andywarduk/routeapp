export default class Permissions
{

  constructor(perms) {
    this.perms = perms || {}
  }

  check = (perm) => {
    var ok = false

    if (this.perms.admin || this.perms[perm]) ok = true

    return ok
  }

}