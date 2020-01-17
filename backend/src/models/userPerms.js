var mongoose = require('mongoose')
var Schema = mongoose.Schema

var permissions = require('../auth/permissions')
var { permsEnum } = permissions

// Schema
var UserPerms = new Schema({
  athleteid: {
    type: Number,
    unique: true
  },
}, {
  strict: false
})

// Add permissions
var perms = Object.keys(permsEnum).reduce((obj, k) => {
  obj[permsEnum[k]] = Boolean
  return obj
}, {})

UserPerms.add({
  perms
})

module.exports = mongoose.model('UserPerms', UserPerms)
