const axios = require('axios')
const queryString = require('query-string')

module.exports = {
  
  tokenExchange: async (clientId, token, clientSecret) => {
    // Do strava token exchange

    const body = {
      client_id: clientId,
      code: token,
      client_secret: clientSecret,
      grant_type: 'authorization_code'
    }

    const result = await axios.post('https://www.strava.com/oauth/token', queryString.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return result.data
  },

  refreshToken: async (clientId, clientSecret, refreshToken) => {
    // Do strava token refresh

    const body = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }

    const result = await axios.post('https://www.strava.com/oauth/token', queryString.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return result.data
  }

}
