const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Schema
const Users = new Schema({
  athleteid: {
    type: Number,
    unique: true
  },
  stravaUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StravaUser'
  },
  perms: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPerms'
  },
  auth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuths'
  }
})

Users.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
  }
})

module.exports = mongoose.model('Users', Users)
