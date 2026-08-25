import { Schema, Types, model, HydratedDocument } from 'mongoose'

import { stripInternals } from './transform'

export interface IUserAuth {
  user: Types.ObjectId
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
}

export type IUserAuthDocument = HydratedDocument<IUserAuth>

// Schema
const UserAuths = new Schema<IUserAuth>({
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
    const out = stripInternals(ret)

    out.access_token = 'xxxx'
    out.refresh_token = 'xxxx'

    return out
  }
})

export default model<IUserAuth>('UserAuths', UserAuths)
