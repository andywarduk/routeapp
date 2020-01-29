const mongoose = require('mongoose')
const Schema = mongoose.Schema

const permissions = require('../auth/permissions')
const { permsEnum } = permissions

// Schema
const UserPerms = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }
})

// Add permissions
for (const k of Object.keys(permsEnum)) {
  UserPerms.add({
    [permsEnum[k]]: Boolean
  })
}

UserPerms.set('toJSON', {
  transform: (doc, ret) => {
    const permsList = []

    for (const k of Object.keys(permsEnum)) {
      permsList.push(permsEnum[k])
    }

    for (const k of Object.keys(ret)) {
      if (permsList.indexOf(k) < 0) delete ret[k]
    }
  }
})

module.exports = mongoose.model('UserPerms', UserPerms)
