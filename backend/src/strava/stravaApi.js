const axios = require('axios')

module.exports = {
  
  getRoute: async (accessToken, id) => {
    // Gets a route from strava

    const result = await axios.get(`https://www.strava.com/api/v3/routes/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return result.data
  }

}