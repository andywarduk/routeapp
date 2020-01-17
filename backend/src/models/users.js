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
  profile: String
}, {
  strict: false
})

module.exports = mongoose.model('Users', Users)
