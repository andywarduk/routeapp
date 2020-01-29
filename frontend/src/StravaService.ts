import axios from 'axios'

import { buildResponse, buildErrorResponse, ServiceResponse } from './Service'

// Types

export interface IStravaRoute {
  // TODO
  [propName: string]: any
}

// Class definition

export default class StravaService {

  async route(bearer: string, id: number) {
    let result: ServiceResponse<IStravaRoute>

    try {
      const res = await axios.get(`/api/strava/route/${id}`, {
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
