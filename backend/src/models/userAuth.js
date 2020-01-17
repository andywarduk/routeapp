var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Schema
var UserAuth = new Schema({
  athleteid: {
    type: Number,
    unique: true
  },
  access_token: String,
  refresh_token: String,
  expires_at: Number,
  expires_in: Number
}, {
  strict: true
})

module.exports = mongoose.model('UserAuth', UserAuth)
