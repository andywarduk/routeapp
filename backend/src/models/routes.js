var mongoose = require('mongoose')
var Schema = mongoose.Schema

// schema
var Routes = new Schema({
  routeid: {
    type: Number,
    unique: true
  },
  name: String,
  description: String,
  distance: Number,
  elevation_gain: Number,
  estimated_moving_time: Number,
  athlete: {
    firstname: String,
    lastname: String
  }
}, {
  strict: false
})

Routes.index({
  name: "text",
  description: "text"
})

module.exports = mongoose.model('Routes', Routes)
