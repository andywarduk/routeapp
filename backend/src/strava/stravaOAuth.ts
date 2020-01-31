import axios from 'axios'
import queryString from 'query-string'

export default {
  
  tokenExchange: async (clientId: string, token: string, clientSecret: string) => {
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

  refreshToken: async (clientId: string, clientSecret: string, refreshToken: string) => {
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
