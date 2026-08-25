import { Schema, model, HydratedDocument } from 'mongoose'

import { stripInternals } from './transform'

export interface IStravaUser {
  id: number
  username: string
  firstname: string
  lastname: string
  city: string
  state: string
  country: string
  sex: string
  created_at: string
  updated_at: string
  profile_medium: string
  profile: string
}

export type IStravaUserDocument = HydratedDocument<IStravaUser>

// Schema
const StravaUser = new Schema<IStravaUser>({
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
  strict: false,
  id: false
})

StravaUser.set('toJSON', {
  transform: (_doc, ret) => stripInternals(ret)
})

export default model<IStravaUser>('StravaUser', StravaUser)
