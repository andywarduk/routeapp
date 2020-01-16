var mongoose = require('mongoose')
var Schema = mongoose.Schema

var permissions = require('../auth/permissions')
var { permsEnum } = permissions

// Schema
var Users = new Schema({
  athleteid: {
    type: Number,
    unique: true
  },
  username: String,
  firstname: String,
  lastname: String,
  city: String,
  state: String,
  country: String,
  sex: String,
  created_at: String,
  updated_at: String,
  profile_medium: String,
  profile: String,
  auth: {
    access_token: String,
    refresh_token: String,
    expires_at: Number,
    expires_in: Number
  },
}, {
  strict: false
})

// Add permissions
var perms = Object.keys(permsEnum).reduce((obj, k) => {
  obj[permsEnum[k]] = Boolean
  return obj
}, {})

Users.add({
  perms
})

module.exports = mongoose.model('Users', Users)
