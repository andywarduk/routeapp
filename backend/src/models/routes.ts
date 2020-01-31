import { Document, Schema, model } from 'mongoose'

export interface IRoutes {
  routeid: number
  name: string
  description: string
  distance: number
  elevation_gain: number
  estimated_moving_time: number
  updatedAt: string
  map: {
    polyline: string
    summary_polyline: string
  }
}

export interface IRoutesModel extends IRoutes, Omit<Document, 'id'> {
}

// Schema
const Routes = new Schema({
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
  transform: (_doc, ret) => {
    delete ret._id
    delete ret.__v
  }
})

// Hack for type checking...
interface IRoutesModelHack extends Omit<IRoutes, 'id'>, Document {
}

export default model<IRoutesModelHack>('Routes', Routes)
