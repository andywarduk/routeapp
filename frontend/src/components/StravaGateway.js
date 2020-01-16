import React, { Component } from 'react'
import {
  withRouter,
  Redirect
} from 'react-router-dom'
import queryString from 'query-string'

import StravaContext from './StravaContext'
import AuthService from '../AuthService'

class StravaGateway extends Component {

  AUTHSTAGE_START = 1
  AUTHSTAGE_TOKEN = 2
  AUTHSTAGE_AUTH = 3
  AUTHSTAGE_FAIL = -1

  constructor(props) {
    super(props)

    // Get router details
    var { match, location } = this.props

    // Get sub path
    var subPath = location.pathname.substr(match.path.length)

    // Set initial state
    this.state = {
      authStage: this.AUTHSTAGE_START,
      token: null,
      auth: null
    }

    // Create the auth service
    this.authService = new AuthService()

    if (subPath === '/token' || subPath.startsWith('/token/')) {
      // At token response URL
      var searchValues = queryString.parse(location.search)

      if (searchValues.error) {
        // Failed response
        this.state.authStage = this.AUTHSTAGE_FAIL
      } else {
        // Got token
        this.state.authStage = this.AUTHSTAGE_TOKEN
        this.state.token = searchValues.code
      }
    } 

  }

  componentDidMount = async () => {
    if (this.state.authStage === this.AUTHSTAGE_TOKEN) {
      try {
        // Finish authentication on the back end
        var res = await this.authService.auth(process.env.REACT_APP_STRAVA_CLIENT_ID, this.state.token)

        this.setState({
          authStage: this.AUTHSTAGE_AUTH,
          auth: res.data
        })

      } catch (err) {
        // Failed
        this.setState({
          authStage: this.AUTHSTAGE_FAIL
        })

      }

    }
  }

  render() {
    var { authStage } = this.state
    var { match, location, children } = this.props

    var subPath = location.pathname.substr(match.path.length)

    var content

    switch(authStage) {
      case this.AUTHSTAGE_START:
        // Redirect to strava for authentication
        var returnPath = `${window.location.origin}${match.path}/token${subPath}`

        var search = {
          client_id: process.env.REACT_APP_STRAVA_CLIENT_ID,
          response_type: 'code',
          redirect_uri: returnPath,
          approval_prompt: 'auto',
          scope: 'read'
        }

        setImmediate(() => {
          window.location = `http://www.strava.com/oauth/authorize?${queryString.stringify(search)}`
        })
        
        content = (
          <div className='row'>
            <div className='row'>
              Redirecting to Strava for authentication...
            </div>
          </div>
        )

        break

      case this.AUTHSTAGE_TOKEN:
        // Got token - finish authentication
        content = (
          <div className='row'>
            <div className='row'>
              Authenticating...
            </div>
          </div>
        )

        break

      case this.AUTHSTAGE_AUTH:
        // Authenticated
        if (subPath === '/token' || subPath.startsWith('/token/')) {
          var redirect = `${match.path}${subPath.substr(6)}`

          content = <Redirect to={redirect}/>

        } else {
          content = (
            <StravaContext.Provider value={this.state.auth}>
              {children}
            </StravaContext.Provider>
          )
  
        }

        break

      default:
        content = (
          <div className='row'>
            <div className='row'>
              Authentication failure
            </div>
          </div>
        )

        break
        
    }

    return content

  }

}

export default withRouter(StravaGateway)