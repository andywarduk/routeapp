import { Schema, model, HydratedDocument } from 'mongoose'

import { stripInternals } from './transform'

import { IUserAuthDocument } from './userAuths'
import { IPermsDocument } from './userPerms'
import { IStravaUserDocument } from './stravaUsers'

/*
 * stravaUser/perms/auth are ObjectId references. Every read path in the app
 * populates them before use, so they are typed as the populated documents.
 */
export interface IUser {
  athleteid: number
  stravaUser: IStravaUserDocument
  perms: IPermsDocument
  auth: IUserAuthDocument
}

export type IUserDocument = HydratedDocument<IUser>

// Schema
const Users = new Schema<IUser>({
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
  transform: (_doc, ret) => stripInternals(ret)
})

export default model<IUser>('Users', Users)
