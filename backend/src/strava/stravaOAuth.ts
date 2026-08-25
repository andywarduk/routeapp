import axios from 'axios'

const tokenUrl = 'https://www.strava.com/oauth/token'

const formPost = async (body: Record<string, string>) => {
  // query-string went ESM-only at v8; URLSearchParams is built in and equivalent here
  const result = await axios.post(tokenUrl, new URLSearchParams(body).toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  return result.data
}

export default {

  tokenExchange: async (clientId: string, token: string, clientSecret: string) => {
    // Do strava token exchange
    return formPost({
      client_id: clientId,
      code: token,
      client_secret: clientSecret,
      grant_type: 'authorization_code'
    })
  },

  refreshToken: async (clientId: string, clientSecret: string, refreshToken: string) => {
    // Do strava token refresh
    return formPost({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

}
