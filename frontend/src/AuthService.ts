import axios from 'axios'

import { buildResponse, buildErrorResponse, ServiceResponse } from './Service'
import { IPermissionKey, IPermissionList } from './Permissions'

// Types

export interface IAuth {
  jwt: string
  picMed: string
  fullName: string
  perms: IPermissionList
}

// Class definition

export default class AuthService {

  async auth(clientId: string, token: string) {
    let result: ServiceResponse<IAuth>

    const data = {
      clientId,
      token
    }

    try {
      const res = await axios.post('/api/auth/', data)
      result = buildResponse(res)
    } catch (err) {
      result = buildErrorResponse(err)
    }

    return result
  }

  async getPermKeys(bearer: string) {
    let result: ServiceResponse<IPermissionKey[]>

    try {
      const res = await axios.get(`/api/auth/permkeys`, {
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
