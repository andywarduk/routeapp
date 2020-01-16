import axios from 'axios';
import { buildResponse, buildErrorResponse } from './Response'

export default class RouteService {

  async all(bearer) {
    var result

    try {
      var res = await axios.get('/api/routes/', {
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

  async add(bearer, routeid, route) {
    var result

    try {
      var res = await axios.post(`/api/routes/add/${routeid}`, route, {
        headers: {
          'Authorization': `Bearer ${bearer}`
        }
      })
      result = buildResponse(res)
    } catch (err) {
      result = buildErrorResponse(res)
    }

    return result
  }

  async replace(bearer, routeid, route) {
    var result

    try {
      var res = await axios.post(`/api/routes/replace/${routeid}`, route, {
        headers: {
          'Authorization': `Bearer ${bearer}`
        }
      })
      result = buildResponse(res)
    } catch (err) {
      result = buildErrorResponse(res)
    }

    return result
  }

}
