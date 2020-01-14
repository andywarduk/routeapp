import axios from 'axios'

import { buildResponse, buildErrorResponse } from './Response'

export default class AuthService {

  async auth(clientId, token) {
    var result

    var data = {
      clientId,
      token
    }

    try {
      var res = await axios.post('/api/auth/', data)
      result = buildResponse(res)
    } catch (err) {
      result = buildErrorResponse(err)
    }

    return result
  }

}
