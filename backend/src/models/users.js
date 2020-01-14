var mongoose = require('mongoose')
var Schema = mongoose.Schema

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
  }
}, {
  strict: false
})

module.exports = mongoose.model('Users', Users)
