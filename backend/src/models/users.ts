import { Document, Schema, model } from 'mongoose'

import { IUserAuthModel } from './userAuths'
import { IPermsModel } from './userPerms'
import { IStravaUserModel } from './stravaUsers'

export interface IUser {
  athleteid: number
  stravaUser: IStravaUserModel
  perms: IPermsModel
  auth: IUserAuthModel
}

export interface IUserModel extends IUser, Document {
}

// Schema
const Users = new Schema({
  athleteid: {
    type: Number,
    unique: true
  },
  stravaUser: {
    type: Schema.Types.ObjectId,
    ref: 'StravaUser'
  },
  perms: {
    type: Schema.Types.ObjectId,
    ref: 'UserPerms'
  },
  auth: {
    type: Schema.Types.ObjectId,
    ref: 'UserAuths'
  }
})

Users.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id
    delete ret.__v
  }
})

export default model<IUserModel>('Users', Users)
