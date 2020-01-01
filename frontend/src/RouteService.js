import axios from 'axios';

export default class RouteService {

  async search(filter) {
    var result

    // TODO filter

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

}
