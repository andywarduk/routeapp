import { Schema, model, HydratedDocument } from 'mongoose'

import { stripInternals } from './transform'

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

export type IRoutesDocument = HydratedDocument<IRoutes>

// Schema
const Routes = new Schema<IRoutes>({
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
  transform: (_doc, ret) => stripInternals(ret)
})

export default model<IRoutes>('Routes', Routes)
