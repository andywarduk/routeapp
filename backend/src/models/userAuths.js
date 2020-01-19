var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Schema
var UserAuths = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  access_token: String,
  refresh_token: String,
  expires_at: Number,
  expires_in: Number
})

UserAuths.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v

    ret.access_token = 'xxxx'
    ret.refresh_token = 'xxxx'
  }
})

module.exports = mongoose.model('UserAuths', UserAuths)
