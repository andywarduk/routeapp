import { Document, Schema, model } from 'mongoose'

export interface IUserAuth {
  user: string
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
}

export interface IUserAuthModel extends IUserAuth, Document {
}

// Schema
const UserAuths = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  access_token: String,
  refresh_token: String,
  expires_at: Number,
  expires_in: Number
})

UserAuths.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id
    delete ret.__v

    ret.access_token = 'xxxx'
    ret.refresh_token = 'xxxx'
  }
})

export default model<IUserAuthModel>('UserAuths', UserAuths)
