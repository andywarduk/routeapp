import React, { Component } from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import queryString from 'query-string'

import StravaContext from './StravaContext'
import AuthService from '../AuthService'

class StravaGateway extends Component {

  AUTHSTAGE_START = 1
  AUTHSTAGE_TOKEN = 2
  AUTHSTAGE_AUTH = 3
  AUTHSTAGE_FAIL = -1
  AUTHSTAGE_TOKENFAIL = -2

  tokenPath = 'token'

  constructor(props) {
    super(props)

    // Get router details
    var { match, location } = this.props

    // Get sub path
    var matchPath = match.path.replace(/\/+$/, "");
    var subPath = location.pathname.substr(matchPath.length)

    // Set initial state
    this.state = {
      authStage: this.AUTHSTAGE_START,
      token: null,
      auth: null
    }

    // Create the auth service
    this.authService = new AuthService()

    if (subPath === `/${this.tokenPath}` || subPath.startsWith(`/${this.tokenPath}/`)) {
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

  componentDidMount = () => {
    if (this.state.authStage === this.AUTHSTAGE_TOKEN) {
      this.finishAuth()
    }
  }

  finishAuth = async () => {
    try {
      // Finish authentication on the back end
      var res = await this.authService.auth(process.env.REACT_APP_STRAVA_CLIENT_ID, this.state.token)

      if (res.ok) {
        this.setState({
          authStage: this.AUTHSTAGE_AUTH,
          auth: res.data
        })  
      } else {
        this.setState({
          authStage: this.AUTHSTAGE_TOKENFAIL
        })  
      }

    } catch (err) {
      // Failed
      this.setState({
        authStage: this.AUTHSTAGE_TOKENFAIL
      })

    }
  }

  tokenRedirect = (subPath, matchPath, normalContent) => {
    // If URL is the token URL then redirect to the original URL...
    if (subPath === `/${this.tokenPath}` || subPath.startsWith(`/${this.tokenPath}/`)) {
      var redirect = `${matchPath}${subPath.substr(this.tokenPath.length + 1)}`

      return <Redirect to={redirect}/>
    } 
    
    // ... otherwise return the normal contents
    return normalContent
  }

  render() {
    var { authStage } = this.state
    var { match, location, children } = this.props

    var matchPath = match.path.replace(/\/+$/, "");
    var subPath = location.pathname.substr(matchPath.length)

    var content

    switch(authStage) {
      case this.AUTHSTAGE_START:
        // Redirect to strava for authentication
        var returnPath = `${window.location.origin}${matchPath}/${this.tokenPath}${subPath}`

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
        
        content = this.holdingPage('Redirecting to Strava for authentication...')

        break

      case this.AUTHSTAGE_TOKEN:
        // Got token - finish authentication
        content = this.holdingPage('Finishing authentication...')

        break

      case this.AUTHSTAGE_TOKENFAIL:
        // Failed authentication at token exchange
        content = this.tokenRedirect(subPath, matchPath, this.holdingPage('Authentication failure'))

        break
  
      case this.AUTHSTAGE_AUTH:
        // Authenticated
        content = this.tokenRedirect(subPath, matchPath, (
          <StravaContext.Provider value={this.state.auth}>
            {children}
          </StravaContext.Provider>
        ))
  
        break

      default:
        // Failure
        content = this.holdingPage('Authentication failure')

        break
        
    }

    return content

  }

  holdingPage = (message) => {
    var { HoldPage } = this.props

    if (HoldPage && typeof(HoldPage) === 'function') {
      return (
        <HoldPage>
          <div className='row mt-2'>
            <div className='col'>
              <span className='mt-2'>{message}</span>
            </div>
          </div>
        </HoldPage>
      )
    }

    return message
  }

}

export default withRouter(StravaGateway)
