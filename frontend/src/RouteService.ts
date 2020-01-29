import axios from 'axios';
import { buildResponse, buildErrorResponse, ServiceResponse } from './Service'

import { IStravaRoute } from './StravaService'

// Types

export interface IRouteSearchFilter {
  srchText?: string
  partialWord?: boolean
  distFrom?: number
  distTo?: number
  elevFrom?: number
  elevTo?: number
}

export interface IRouteSearchOptions {
  columns?: string[],
  sort?: {
    column: string
    ascending: boolean
  }
  filter?: IRouteSearchFilter
}

export interface IRoute {
  // TODO
  [propName: string]: any
}

// Route service class

export default class RouteService {

  async search(bearer: string, options?: IRouteSearchOptions) {
    let result: ServiceResponse<IRoute[]>

    try {
      const res = await axios.post('/api/routes/', options, {
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

  async get(bearer: string, routeid: number) {
    let result: ServiceResponse<IRoute>

    try {
      const res = await axios.get(`/api/routes/${routeid}`, {
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

  async getPolyline(bearer: string, routeid: number) {
    let result: ServiceResponse<string>

    try {
      const res = await axios.get(`/api/routes/${routeid}/polyLine`, {
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

  async getSummaryPolyline(bearer: string, routeid: number) {
    let result: ServiceResponse<string>

    try {
      const res = await axios.get(`/api/routes/${routeid}/summaryPolyLine`, {
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

  async upsert(bearer: string, routeid: number, route: IStravaRoute) {
    let result: ServiceResponse<string>

    try {
      const res = await axios.post(`/api/routes/${routeid}`, route, {
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

  async replace(bearer: string, routeid: number, route: IStravaRoute) {
    let result: ServiceResponse<string>

    try {
      const res = await axios.put(`/api/routes/${routeid}`, route, {
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

  async delete(bearer: string, routeid: number) {
    let result: ServiceResponse<string>

    try {
      const res = await axios.delete(`/api/routes/${routeid}`, {
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
