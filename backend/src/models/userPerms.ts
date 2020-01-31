import { Schema, Document, model } from 'mongoose'
import { keys } from 'ts-transformer-keys'

export interface IPerms {
  admin: boolean
  viewRoutes: boolean
  modifyRoutes: boolean
  checkAllRoutes: boolean
  deleteRoutes: boolean
}

export const IPermsKeys = keys<IPerms>();

export interface IPermsModel extends IPerms, Document {
}

// Schema
const UserPerms = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
})

// Add permissions
for (const k of IPermsKeys) {
  UserPerms.add({
    [k]: Boolean
  })
}

UserPerms.set('toJSON', {
  transform: (_doc, ret) => {
    // Only return keys in IPerms
    for (const k of Object.keys(ret)) {
      if (IPermsKeys.indexOf(k as keyof IPerms) < 0) delete ret[k]
    }
  }
})

export default model<IPermsModel>('UserPerms', UserPerms)
