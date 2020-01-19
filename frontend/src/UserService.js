import axios from 'axios';
import { buildResponse, buildErrorResponse } from './Response'

export default class RouteService {

  async search(bearer, options) {
    var result

    try {
      var res = await axios.post('/api/users/', options, {
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

  async get(bearer, athleteid) {
    var result

    try {
      var res = await axios.get(`/api/users/${athleteid}`, {
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

  async setPerms(bearer, athleteid, perms) {
    var result

    try {
      var res = await axios.put(`/api/users/${athleteid}/perms`, perms, {
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
