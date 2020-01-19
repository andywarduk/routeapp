var mongoose = require('mongoose')
var Schema = mongoose.Schema

var permissions = require('../auth/permissions')
var { permsEnum } = permissions

// Schema
var UserPerms = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }
})

// Add permissions
for (k of Object.keys(permsEnum)) {
  UserPerms.add({
    [permsEnum[k]]: Boolean
  })
}

UserPerms.set('toJSON', {
  transform: (doc, ret) => {
    var permsList = []

    for (k of Object.keys(permsEnum)) {
      permsList.push(permsEnum[k])
    }

    for (k of Object.keys(ret)) {
      if (permsList.indexOf(k) < 0) delete ret[k]
    }
  }
})

module.exports = mongoose.model('UserPerms', UserPerms)
