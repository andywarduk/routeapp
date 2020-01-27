var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Schema
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
  updatedAt: String,
  map: {
    polyline: String,
    summary_polyline: String
  }
}, {
  strict: false
})

Routes.index({
  name: "text",
  description: "text"
})

Routes.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
  }
})

module.exports = mongoose.model('Routes', Routes)
