import { Document, Schema, model } from 'mongoose'

export interface IStravaUser {
  id: number
  username: string
  firstname: string
  lastname: string,
  city: string,
  state: string,
  country: string,
  sex: string,
  created_at: string,
  updated_at: string,
  profile_medium: string,
  profile: string
}

export interface IStravaUserModel extends IStravaUser, Omit<Document, 'id'> {
}

// Schema
const StravaUser = new Schema({
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
  transform: (_doc, ret) => {
    delete ret._id
    delete ret.__v
  }
})

// Hack for type checking...
interface IStravaUserModelHack extends Omit<IStravaUser, 'id'>, Document {
}

export default model<IStravaUserModelHack>('StravaUser', StravaUser)
