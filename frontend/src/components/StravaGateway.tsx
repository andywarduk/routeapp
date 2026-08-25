import { Component, ComponentType, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LatLngTuple } from 'leaflet'
import polyline from '@mapbox/polyline'

import StravaContext, { IStravaContext } from './StravaContext'
import AuthService from '../AuthService'
import RouteService from '../RouteService'
import { withRouter, RouterProps } from './withRouter'

// Types

enum AuthStage {
  AUTHSTAGE_START = 1,
  AUTHSTAGE_TOKEN = 2,
  AUTHSTAGE_AUTH = 3,
  AUTHSTAGE_FAIL = -1,
  AUTHSTAGE_TOKENFAIL = -2
}

interface IProps {
  HoldPage: ComponentType<{ children?: ReactNode }>
  children?: ReactNode
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

class StravaGateway extends Component<RouterProps & IProps, IState> {

  authService: AuthService
  routeService: RouteService
  tokenPath = 'token'

  stravaContext: IStravaContext = {
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

  constructor(props: RouterProps & IProps) {
    super(props)

    // Get router details. The gateway wraps the whole app at the router root,
    // so the sub path is simply the current pathname.
    const { location } = this.props

    const subPath = location.pathname

    // Create route service
    this.routeService = new RouteService()

    // Create the auth service
    this.authService = new AuthService()

    // Set up initial state
    let authStage = AuthStage.AUTHSTAGE_START
    let token = null

    if (subPath === `/${this.tokenPath}` || subPath.startsWith(`/${this.tokenPath}/`)) {
      // At token response URL
      const searchValues = new URLSearchParams(location.search)
      const code = searchValues.get('code')

      if (searchValues.get('error') || !code) {
        // Failed response
        authStage = AuthStage.AUTHSTAGE_FAIL
      } else {
        // Got token
        authStage = AuthStage.AUTHSTAGE_TOKEN
        token = code
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
      const res = await this.authService.auth(import.meta.env.VITE_STRAVA_CLIENT_ID || '', this.state.token || '')

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

    } catch {
      // Failed
      this.setState({
        authStage: AuthStage.AUTHSTAGE_TOKENFAIL
      })

    }
  }

  tokenRedirect = (subPath: string, normalContent: ReactNode) => {
    // If URL is the token URL then redirect to the original URL...
    if (subPath === `/${this.tokenPath}` || subPath.startsWith(`/${this.tokenPath}/`)) {
      const redirect = subPath.substring(this.tokenPath.length + 1) || '/'

      return <Navigate to={redirect} replace/>
    }

    // ... otherwise return the normal contents
    return normalContent
  }

  render() {
    const { authStage } = this.state
    const { location, children } = this.props

    const subPath = location.pathname

    let content

    switch(authStage) {
      case AuthStage.AUTHSTAGE_START:
        // Redirect to strava for authentication
        {
          const returnPath = `${window.location.origin}/${this.tokenPath}${subPath}`

          const search = new URLSearchParams({
            client_id: import.meta.env.VITE_STRAVA_CLIENT_ID || '',
            response_type: 'code',
            redirect_uri: returnPath,
            approval_prompt: 'auto',
            scope: 'read'
          })

          setTimeout(() => {
            window.location.href = `https://www.strava.com/oauth/authorize?${search.toString()}`
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
        content = this.tokenRedirect(subPath, this.holdingPage('Authentication failure'))

        break
  
      case AuthStage.AUTHSTAGE_AUTH:
        // Authenticated
        content = this.tokenRedirect(subPath, (
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
