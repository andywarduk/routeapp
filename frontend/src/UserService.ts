import axios from 'axios'

import { buildResponse, buildErrorResponse, ServiceResponse } from './Service'
import { IPermissionList } from './Permissions'

// Types

export interface IUserSearchOptions {
  columns?: string[],
  sort?: {
    column: string
    ascending: boolean
  },
  perms?: boolean
}

export interface IUser {
  perms?: IPermissionList
  [key: string]: any
}

// Class definition

export default class UserService {

  async search(bearer: string, options?: IUserSearchOptions) {
    let result: ServiceResponse<IUser[]>

    try {
      const res = await axios.post('/api/users/', options, {
        headers: {
          'Authorization': `Bearer ${bearer}`
        }
      })
      result = buildResponse(res)
    } catch (err) {
      result = buildErrorResponse(err)
    }

    return result
  }

  async get(bearer: string, athleteid: number) {
    let result: ServiceResponse<IUser>

    try {
      const res = await axios.get(`/api/users/${athleteid}`, {
        headers: {
          'Authorization': `Bearer ${bearer}`
        }
      })
      result = buildResponse(res)
    } catch (err) {
      result = buildErrorResponse(err)
    }

    return result
  }

  async setPerms(bearer: string, athleteid: number, perms: IPermissionList) {
    let result: ServiceResponse<string>

    try {
      const res = await axios.put(`/api/users/${athleteid}/perms`, perms, {
        headers: {
          'Authorization': `Bearer ${bearer}`
        }
      })
      result = buildResponse(res)
    } catch (err) {
      result = buildErrorResponse(err)
    }

    return result
  }

}
