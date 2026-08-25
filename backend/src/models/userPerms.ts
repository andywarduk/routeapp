import { Schema, Types, model, HydratedDocument } from 'mongoose'

import { asRecord } from './transform'

export interface IPerms {
  admin: boolean
  viewRoutes: boolean
  modifyRoutes: boolean
  checkAllRoutes: boolean
  deleteRoutes: boolean
}

/*
 * Previously derived at compile time by ts-transformer-keys, which needed
 * ttypescript - unmaintained and unsupported on TypeScript 5. Listing the keys
 * via a Record<keyof IPerms, true> keeps them checked: adding a field to IPerms
 * without adding it here fails to compile, and so does a key that is not in
 * IPerms.
 */
const permsFields: Record<keyof IPerms, true> = {
  admin: true,
  viewRoutes: true,
  modifyRoutes: true,
  checkAllRoutes: true,
  deleteRoutes: true
}

export const IPermsKeys = Object.keys(permsFields) as (keyof IPerms)[]

export interface IUserPerms extends IPerms {
  user: Types.ObjectId
}

export type IPermsDocument = HydratedDocument<IUserPerms>

// Schema
const UserPerms = new Schema<IUserPerms>({
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
    const out = asRecord(ret)

    for (const k of Object.keys(out)) {
      if (!(IPermsKeys as string[]).includes(k)) delete out[k]
    }

    return out
  }
})

export default model<IUserPerms>('UserPerms', UserPerms)
