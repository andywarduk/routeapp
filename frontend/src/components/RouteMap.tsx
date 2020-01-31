import React, { Component, CSSProperties } from 'react'
import { Map, TileLayer, Polyline, Popup, MapProps } from 'react-leaflet'
import { LatLngBounds, LatLngTuple } from 'leaflet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import StravaContext from './StravaContext'
import Distance from './Distance'
import StravaRouteLink from './StravaRouteLink'
import { IRoute } from '../RouteService'

// Types

interface IProps {
  routes: IRoute[]
}

interface MinMax {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
  minDist: number
  maxDist: number
}

interface IState extends MinMax {
  loading: boolean
  polyLines: IPolyLine[]
  mapCentre: LatLngTuple
}

interface IPolyLine {
  routeid: number
  distance: number
  elevation_gain: number
  name: string
  polyLine: null | LatLngTuple[]
}

// Class definition

export default class RouteMap extends Component<IProps, IState> {
  static contextType: typeof StravaContext = StravaContext
  context!: React.ContextType<typeof StravaContext>

  constructor(props: IProps) {
    super(props)

    const mapCentreEnv = (process.env.REACT_APP_MAP_CENTRE || '').split(',').map(parseFloat)

    let mapCentre: LatLngTuple

    if (mapCentreEnv.length === 2) {
      mapCentre = [mapCentreEnv[0], mapCentreEnv[1]]
    } else {
      mapCentre = [0, 0]
    }

    // Initial state
    this.state = {
      loading: false,
      polyLines: [],
      mapCentre,
      ...this.defaultMinMax(mapCentre)
    }
  }

  routesChanged = () => {
    const { routes } = this.props
    const { loading, polyLines } = this.state

    let changed = false

    if (!loading) {
      // Compare routes with polylines in state
      if (routes.length !== polyLines.length) {
        changed = true
      } else {
        for(let i = 0; i < routes.length; i++) {
          if (routes[i].routeid !== polyLines[i].routeid) {
            changed = true
            break
          }
        }  
      }
    }

    if (changed) {
      setTimeout(this.getPolyLines, 0)
    }
  }

  defaultMinMax = (mapCentre: LatLngTuple): MinMax => {
    const minMax = {
      minLat: mapCentre[0],
      maxLat: mapCentre[0],
      minLon: mapCentre[1],
      maxLon: mapCentre[1],

      minDist: 0,
      maxDist: 0
    }

    return minMax
  }

  boundingBox = () => {
    let { minLat = 0, minLon = 0, maxLat = 0, maxLon = 0 } = this.state

    const latDiff = maxLat - minLat
    const lonDiff = maxLon - minLon

    if (latDiff === 0) {
      if (lonDiff === 0) {
        minLat -= 0.1
        maxLat += 0.1
        minLon -= 0.1
        maxLon += 0.1
      } else {
        minLat -= lonDiff / 2
        maxLat += lonDiff / 2
      }
    } else if (lonDiff === 0) {
      minLon -= latDiff / 2
      maxLon += latDiff / 2
    }

    return new LatLngBounds([minLat, minLon], [maxLat, maxLon])
  }

  getPolyLines = async () => {
    const { routes } = this.props
    const { mapCentre } = this.state

    this.setState({
      loading: true
    })

    // Create new polylines array
    let polyLines = routes.map((r): IPolyLine => {
      return {
        routeid: r.routeid,
        distance: r.distance,
        elevation_gain: r.elevation_gain,
        name: r.name,
        polyLine: null
      }
    })

    // Load all route summary polylines
    const promises = polyLines.map((r) => {
      return this.context.getCachedSummaryPolyLine(r.routeid)
    })

    // Process results
    for (let i = 0; i < promises.length; i++) {
      const p = promises[i]
      const pl = polyLines[i]

      try {
        pl.polyLine  = await p
      } catch(err) {
        pl.polyLine = null
      }
    }

    const minMax: MinMax = this.defaultMinMax(mapCentre)

    // Calculate bounding box
    polyLines.reduce((minMax, pl) => {
      if (pl.polyLine && Array.isArray(pl.polyLine)) {
        minMax = pl.polyLine.reduce((newState, p) => {
          if (p[0] < minMax.minLat) newState.minLat = p[0]
          if (p[0] > minMax.maxLat) newState.maxLat = p[0]
          if (p[1] < minMax.minLon) newState.minLon = p[1]
          if (p[1] > minMax.maxLon) newState.maxLon = p[1]  

          return minMax
        }, minMax)

        if (minMax.minDist === 0 || pl.distance < minMax.minDist) minMax.minDist = pl.distance
        if (pl.distance > minMax.maxDist) minMax.maxDist = pl.distance
      }

      return minMax
    }, minMax)

    // Set the new state
    this.setState({
      ...this.state,
      loading: false,
      polyLines,
      ...minMax
    })
  }

  render = () => {
    const { polyLines, loading, maxDist, minDist } = this.state

    let mapPolyLines

    const mapProps: Partial<MapProps> = {
      scrollWheelZoom: false
    }

    this.routesChanged()

    const distRange = maxDist - minDist

    mapPolyLines = polyLines.reduce((arr: JSX.Element[], p, i) => {
      if (p.polyLine) {
        const distRatio = (distRange === 0 ? 1 : ((p.distance - minDist) / distRange)) * 512

        const red = Math.min(255, distRatio)
        const green = Math.min(255, 512 - distRatio)

        const colour = `rgb(${red},${green},0)`

        arr.push(
          <Polyline key={i} color={colour} positions={p.polyLine}>
            <Popup>
              <StravaRouteLink routeid={p.routeid} desc={p.name}/>
              <table style={{'margin': 'auto'}}>
                <tbody>
                  <tr>
                    <td className='pr-1 text-right'>
                      <Distance m={p.distance} unit='mi' dp={1} showUnit={false}/>
                    </td>
                    <td className='pr-1'>mi</td>
                    <td className='pl-1 pr-1 text-right'>
                      <Distance m={p.elevation_gain} unit='ft' dp={0} showUnit={false}/>
                    </td>
                    <td className='pr-1'>ft</td>
                  </tr>
                  <tr>
                    <td className='pr-1 text-right'>
                      <Distance m={p.distance} unit='km' dp={1} showUnit={false}/>
                    </td>
                    <td className='pr-1'>km</td>
                    <td className='pr-1 pr-1 text-right'>
                      <Distance m={p.elevation_gain} unit='m' dp={0} showUnit={false}/>
                    </td>
                    <td className='pr-1'>m</td>
                  </tr>
                </tbody>
              </table>
            </Popup>
          </Polyline>
        )
      }

      return arr
    }, [])

    mapProps.bounds = this.boundingBox()

    let loadingMsg = null

    if (loading) {
      const outerDivStyle: CSSProperties = {position: 'absolute', zIndex: 5000, width: '100%', textAlign: 'center'}
      const innerDivStyle: CSSProperties = {position: 'relative'}

      loadingMsg = (
        <div style={outerDivStyle}>
          <div style={innerDivStyle}>
            <span className='badge badge-secondary mt-2 py-2 px-2'>
              <span className='mr-2'>Loading...</span><FontAwesomeIcon icon={faSpinner} spin={true}/>
            </span>
          </div>
        </div>
      )
    }

    return (
      <div>
        {loadingMsg}
        <Map style={{'height': '100vw', 'maxHeight': '100vh'}} {...mapProps}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {mapPolyLines}
        </Map>
      </div>
    )
  }

}
