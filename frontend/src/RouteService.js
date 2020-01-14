import axios from 'axios';
import { buildResponse, buildErrorResponse } from './Response'

export default class RouteService {

  async all() {
    var result

    try {
      var res = await axios.get('/api/routes/')
      result = buildResponse(res)
    } catch (err) {
      result = buildErrorResponse(err)
    }

    return result
  }

  async search(options) {
    var result

    try {
      var res = await axios.post('/api/routes/', options)
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
