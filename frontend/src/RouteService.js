import axios from 'axios';
import { buildResponse, buildErrorResponse } from './Response'

export default class RouteService {

  async search(bearer, options) {
    var result

    try {
      var res = await axios.post('/api/routes/', options, {
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

  async get(bearer, routeid) {
    var result

    try {
      var res = await axios.get(`/api/routes/${routeid}`, {
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

  async getPolyline(bearer, routeid) {
    var result

    try {
      var res = await axios.get(`/api/routes/${routeid}/polyLine`, {
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

  async getSummaryPolyline(bearer, routeid) {
    var result

    try {
      var res = await axios.get(`/api/routes/${routeid}/summaryPolyLine`, {
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

  async upsert(bearer, routeid, route) {
    var result

    try {
      var res = await axios.post(`/api/routes/${routeid}`, route, {
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

  async replace(bearer, routeid, route) {
    var result

    try {
      var res = await axios.put(`/api/routes/${routeid}`, route, {
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

  async delete(bearer, routeid) {
    var result

    try {
      var res = await axios.delete(`/api/routes/${routeid}`, {
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
