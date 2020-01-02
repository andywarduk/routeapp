import axios from 'axios';

export default class RouteService {

  async all() {
    var result

    try {
      var res = await axios.get('http://localhost:6200/routes/')

      result = {
        ok: true,
        data: res.data
      }
    } catch (err) {
      console.log(err)

      result = {
        ok: false,
        data: err
      }
    }

    return result
  }

  async search(options) {
    var result

    try {
      var res = await axios.post('http://localhost:6200/routes/', options)

      result = {
        ok: true,
        data: res.data
      }
    } catch (err) {
      console.log(err)

      result = {
        ok: false,
        data: err
      }
    }

    return result
  }

}
