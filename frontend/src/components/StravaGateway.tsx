import { ComponentType, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LatLngTuple } from 'leaflet'
import polyline from '@mapbox/polyline'

import StravaContext, { IStravaContext } from './StravaContext'
import AuthService, { IAuth } from '../AuthService'
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
  HoldPage: ComponentType<{ children?: ReactNode }>
  children?: ReactNode
}

interface IPolyLineCache {
  [key: number]: LatLngTuple[]
}

// Services

const authService = new AuthService()
const routeService = new RouteService()

const tokenPath = 'token'

const atTokenPath = (subPath: string) => {
  return subPath === `/${tokenPath}` || subPath.startsWith(`/${tokenPath}/`)
}

// Component

export default function StravaGateway({ HoldPage, children }: IProps) {
  const location = useLocation()

  // The gateway wraps the whole app at the router root, so the sub path is
  // simply the current pathname.
  const subPath = location.pathname

  /*
   * The initial stage is decided from the URL the app was loaded at, so it is
   * worked out once rather than on every render.
   */
  const [initial] = useState(() => {
    let authStage = AuthStage.AUTHSTAGE_START
    let token: string | null = null

    if (atTokenPath(location.pathname)) {
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

    return { authStage, token }
  })

  const [authStage, setAuthStage] = useState<AuthStage>(initial.authStage)
  const [auth, setAuth] = useState<IAuth | null>(null)

  // The caches are read straight back after being written, so they are held
  // outside of state - filling one must not trigger a render
  const polyLineCache = useRef<IPolyLineCache>({})
  const summaryPolyLineCache = useRef<IPolyLineCache>({})

  const getCachedPolyLine = useCallback(async (routeId: number) => {
    const cache = polyLineCache.current

    if (cache[routeId]) return cache[routeId]

    if (!auth) return null

    const polyLine = await routeService.getPolyline(auth.jwt, routeId)

    if (!polyLine.ok) return null

    cache[routeId] = polyline.decode(polyLine.data) as LatLngTuple[]

    return cache[routeId]
  }, [auth])

  const getCachedSummaryPolyLine = useCallback(async (routeId: number) => {
    const cache = summaryPolyLineCache.current

    if (cache[routeId]) return cache[routeId]

    if (!auth) return null

    const polyLine = await routeService.getSummaryPolyline(auth.jwt, routeId)

    if (!polyLine.ok) return null

    cache[routeId] = polyline.decode(polyLine.data) as LatLngTuple[]

    return cache[routeId]
  }, [auth])

  const stravaContext: IStravaContext = useMemo(() => {
    return {
      auth,
      getCachedPolyLine,
      getCachedSummaryPolyLine
    }
  }, [auth, getCachedPolyLine, getCachedSummaryPolyLine])

  // Finish authentication on the back end once a token has been picked up
  useEffect(() => {
    if (authStage !== AuthStage.AUTHSTAGE_TOKEN) return

    let cancelled = false

    const finishAuth = async () => {
      try {
        const res = await authService.auth(import.meta.env.VITE_STRAVA_CLIENT_ID || '', initial.token || '')

        if (cancelled) return

        if (res.ok) {
          setAuth(res.data)
          setAuthStage(AuthStage.AUTHSTAGE_AUTH)
        } else {
          setAuthStage(AuthStage.AUTHSTAGE_TOKENFAIL)
        }

      } catch {
        // Failed
        if (!cancelled) setAuthStage(AuthStage.AUTHSTAGE_TOKENFAIL)

      }
    }

    finishAuth()

    return () => {
      cancelled = true
    }
  }, [authStage, initial.token])

  // Redirect to strava for authentication
  useEffect(() => {
    if (authStage !== AuthStage.AUTHSTAGE_START) return

    const returnPath = `${window.location.origin}/${tokenPath}${subPath}`

    const search = new URLSearchParams({
      client_id: import.meta.env.VITE_STRAVA_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: returnPath,
      approval_prompt: 'auto',
      scope: 'read'
    })

    window.location.href = `https://www.strava.com/oauth/authorize?${search.toString()}`
  }, [authStage, subPath])

  const holdingPage = (message: string) => {
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

  const tokenRedirect = (normalContent: ReactNode) => {
    // If URL is the token URL then redirect to the original URL...
    if (atTokenPath(subPath)) {
      const redirect = subPath.substring(tokenPath.length + 1) || '/'

      return <Navigate to={redirect} replace/>
    }

    // ... otherwise return the normal contents
    return normalContent
  }

  switch (authStage) {
    case AuthStage.AUTHSTAGE_START:
      // Redirecting to strava (see the effect above)
      return holdingPage('Redirecting to Strava for authentication...')

    case AuthStage.AUTHSTAGE_TOKEN:
      // Got token - finishing authentication
      return holdingPage('Finishing authentication...')

    case AuthStage.AUTHSTAGE_TOKENFAIL:
      // Failed authentication at token exchange
      return tokenRedirect(holdingPage('Authentication failure'))

    case AuthStage.AUTHSTAGE_AUTH:
      // Authenticated
      return tokenRedirect(
        <StravaContext.Provider value={stravaContext}>
          {children}
        </StravaContext.Provider>
      )

    default:
      // Failure
      return holdingPage('Authentication failure')

  }
}
