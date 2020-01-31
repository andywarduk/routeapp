import React from 'react'

import { IAuth } from '../AuthService'
import { LatLngTuple } from 'leaflet'

export interface IStravaContext {
  auth: IAuth | null
  getCachedPolyLine: (routeId: number) => Promise<LatLngTuple[] | null>
  getCachedSummaryPolyLine: (routeId: number) => Promise<LatLngTuple[] | null>
}

const defaultContext: IStravaContext = {
  auth: null,
  getCachedPolyLine: async () => null,
  getCachedSummaryPolyLine: async () => null
}

export default React.createContext<IStravaContext>(defaultContext)
