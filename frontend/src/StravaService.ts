import axios from 'axios'

import { buildResponse, buildErrorResponse, ServiceResponse } from './Service'

// Types

/** A route as returned by the Strava API; stored verbatim. */
export interface IStravaRoute {
  name?: string
  updated_at?: string
  [propName: string]: unknown
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
