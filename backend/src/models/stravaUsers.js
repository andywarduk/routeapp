var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Schema
var StravaUser = new Schema({
  id: {
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

StravaUser.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
  }
})

module.exports = mongoose.model('StravaUser', StravaUser)
