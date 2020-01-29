import React, { Component, ComponentType } from 'react'
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom'
import { LatLngTuple } from 'leaflet'
import queryString from 'query-string'
import polyline from '@mapbox/polyline'

import StravaContext, { IStravaContext } from './StravaContext'
import AuthService from '../AuthService'
import RouteService from '../RouteService'

// Types

enum AuthStage {
  AUTHSTAGE_START = 1,
  AUTHSTAGE_TOKEN = 2,
  AUTHSTAGE_AUTH = 3,
  AUTHSTAGE_FAIL = -1,
  AUTHSTAGE_TOKENFAIL = -2
}

interface IProps {
  HoldPage: ComponentType
}

interface IState {
  authStage: AuthStage
  token: null | string
  polyLineCache: {
    [key: number]: LatLngTuple[]
  }
  summaryPolyLineCache: {
    [key: number]: LatLngTuple[]
  }
}

// Class definition

class StravaGateway extends Component<RouteComponentProps & IProps, IState> {

  authService: AuthService
  routeService: RouteService
  tokenPath = 'token'

  stravaContext : IStravaContext = {
    auth: null,

    getCachedPolyLine: async (routeId: number) => {
      const { polyLineCache } = this.state

      if (polyLineCache[routeId]) return polyLineCache[routeId]
  
      if (!this.stravaContext.auth) return null

      const { jwt } = this.stravaContext.auth
  
      const polyLine = await this.routeService.getPolyline(jwt, routeId)
  
      if (!polyLine.ok) return null
  
      polyLineCache[routeId] = polyline.decode(polyLine.data) as LatLngTuple[]
  
      return polyLineCache[routeId]
    },
  
    getCachedSummaryPolyLine: async (routeId) => {
      const { summaryPolyLineCache } = this.state

      if (summaryPolyLineCache[routeId]) return summaryPolyLineCache[routeId]
  
      if (!this.stravaContext.auth) return null

      const { jwt } = this.stravaContext.auth
  
      const polyLine = await this.routeService.getSummaryPolyline(jwt, routeId)
  
      if (!polyLine.ok) return null
  
      summaryPolyLineCache[routeId] = polyline.decode(polyLine.data) as LatLngTuple[]
  
      return summaryPolyLineCache[routeId]
    }
  }

  constructor(props: RouteComponentProps & IProps) {
    super(props)

    // Get router details
    const { match, location } = this.props

    // Get sub path
    const matchPath = match.path.replace(/\/+$/, "");
    const subPath = location.pathname.substr(matchPath.length)

    // Create route service
    this.routeService = new RouteService()

    // Create the auth service
    this.authService = new AuthService()

    // Set up initial state
    let authStage = AuthStage.AUTHSTAGE_START
    let token = null

    if (subPath === `/${this.tokenPath}` || subPath.startsWith(`/${this.tokenPath}/`)) {
      // At token response URL
      const searchValues = queryString.parse(location.search)

      if (searchValues.error || !searchValues.code || typeof(searchValues.code) !== 'string') {
        // Failed response
        authStage = AuthStage.AUTHSTAGE_FAIL
      } else {
        // Got token
        authStage = AuthStage.AUTHSTAGE_TOKEN
        token = searchValues.code
      }
    } 

    // Set initial state
    this.state = {
      authStage,
      token,
      polyLineCache: {},
      summaryPolyLineCache: {},
    }
    
  }

  componentDidMount = () => {
    if (this.state.authStage === AuthStage.AUTHSTAGE_TOKEN) {
      this.finishAuth()
    }
  }

  finishAuth = async () => {
    try {
      // Finish authentication on the back end
      const res = await this.authService.auth(process.env.REACT_APP_STRAVA_CLIENT_ID || '', this.state.token || '')

      if (res.ok) {
        this.stravaContext.auth = res.data

        this.setState({
          authStage: AuthStage.AUTHSTAGE_AUTH,
        })  
      } else {
        this.setState({
          authStage: AuthStage.AUTHSTAGE_TOKENFAIL
        })  
      }

    } catch (err) {
      // Failed
      this.setState({
        authStage: AuthStage.AUTHSTAGE_TOKENFAIL
      })

    }
  }

  tokenRedirect = (subPath: string, matchPath: string, normalContent: JSX.Element | string) => {
    // If URL is the token URL then redirect to the original URL...
    if (subPath === `/${this.tokenPath}` || subPath.startsWith(`/${this.tokenPath}/`)) {
      const redirect = `${matchPath}${subPath.substr(this.tokenPath.length + 1)}`

      return <Redirect to={redirect}/>
    } 
    
    // ... otherwise return the normal contents
    return normalContent
  }

  render() {
    const { authStage } = this.state
    const { match, location, children } = this.props

    const matchPath = match.path.replace(/\/+$/, "");
    const subPath = location.pathname.substr(matchPath.length)

    let content

    switch(authStage) {
      case AuthStage.AUTHSTAGE_START:
        // Redirect to strava for authentication
        {
          const returnPath = `${window.location.origin}${matchPath}/${this.tokenPath}${subPath}`

          const search = {
            client_id: process.env.REACT_APP_STRAVA_CLIENT_ID,
            response_type: 'code',
            redirect_uri: returnPath,
            approval_prompt: 'auto',
            scope: 'read'
          }

          setTimeout(() => {
            window.location.href = `http://www.strava.com/oauth/authorize?${queryString.stringify(search)}`
          }, 0)
          
          content = this.holdingPage('Redirecting to Strava for authentication...')
        }
        break

      case AuthStage.AUTHSTAGE_TOKEN:
        // Got token - finish authentication
        content = this.holdingPage('Finishing authentication...')

        break

      case AuthStage.AUTHSTAGE_TOKENFAIL:
        // Failed authentication at token exchange
        content = this.tokenRedirect(subPath, matchPath, this.holdingPage('Authentication failure'))

        break
  
      case AuthStage.AUTHSTAGE_AUTH:
        // Authenticated
        content = this.tokenRedirect(subPath, matchPath, (
          <StravaContext.Provider value={this.stravaContext}>
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

  holdingPage = (message: string) => {
    const { HoldPage } = this.props

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
