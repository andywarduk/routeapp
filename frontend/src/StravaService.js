import axios from 'axios'

import { buildResponse, buildErrorResponse } from './Response'

export default class StravaService {

  async route(bearer, id) {
    var result

    try {
      var res = await axios.get(`/api/strava/route/${id}`, {
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
