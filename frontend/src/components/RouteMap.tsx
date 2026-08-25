import { Component, CSSProperties, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Popup, LayersControl, useMap } from 'react-leaflet'
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
  count: number
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

/*
 * react-leaflet 3+ only reads MapContainer props at mount, so a changing
 * bounding box has to be applied through the map instance instead.
 */
const FitBounds = ({ bounds }: { bounds: LatLngBounds }) => {
  const map = useMap()

  // boundingBox() builds a new LatLngBounds every render, so depend on its
  // value rather than its identity - otherwise the effect refires forever
  const box = bounds.toBBoxString()

  useEffect(() => {
    map.fitBounds(bounds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, box])

  return null
}

// Class definition

export default class RouteMap extends Component<IProps, IState> {
  static contextType: typeof StravaContext = StravaContext
  declare context: React.ContextType<typeof StravaContext>

  constructor(props: IProps) {
    super(props)

    const mapCentreEnv = (import.meta.env.VITE_MAP_CENTRE || '').split(',').map(parseFloat)

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
      maxLon: mapCentre[1],

      maxLat: mapCentre[0],
      minLon: mapCentre[1],

      minDist: 0,
      maxDist: 0,

      count: 0
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
    const polyLines = routes.map((r): IPolyLine => {
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
      } catch {
        pl.polyLine = null
      }
    }

    const minMax: MinMax = this.defaultMinMax(mapCentre)

    // Calculate bounding box
    for (const pl of polyLines) {
      if (pl.polyLine && Array.isArray(pl.polyLine)) {
        for (const p of pl.polyLine) {
          if (minMax.count === 0) {
            minMax.minLat = p[0]
            minMax.maxLat = p[0]
            minMax.minLon = p[1]
            minMax.maxLon = p[1]
          } else {
            if (p[0] < minMax.minLat) minMax.minLat = p[0]
            if (p[0] > minMax.maxLat) minMax.maxLat = p[0]
            if (p[1] < minMax.minLon) minMax.minLon = p[1]
            if (p[1] > minMax.maxLon) minMax.maxLon = p[1]
          }

          minMax.count++
        }
      }

      if (minMax.minDist === 0 || pl.distance < minMax.minDist) minMax.minDist = pl.distance
      if (pl.distance > minMax.maxDist) minMax.maxDist = pl.distance
    }

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

    this.routesChanged()

    const distRange = maxDist - minDist

    const mapPolyLines = polyLines.reduce((arr: React.JSX.Element[], p, i) => {
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
                    <td className='pe-1 text-end'>
                      <Distance m={p.distance} unit='mi' dp={1} showUnit={false}/>
                    </td>
                    <td className='pe-1'>mi</td>
                    <td className='ps-1 pe-1 text-end'>
                      <Distance m={p.elevation_gain} unit='ft' dp={0} showUnit={false}/>
                    </td>
                    <td className='pe-1'>ft</td>
                  </tr>
                  <tr>
                    <td className='pe-1 text-end'>
                      <Distance m={p.distance} unit='km' dp={1} showUnit={false}/>
                    </td>
                    <td className='pe-1'>km</td>
                    <td className='pe-1 text-end'>
                      <Distance m={p.elevation_gain} unit='m' dp={0} showUnit={false}/>
                    </td>
                    <td className='pe-1'>m</td>
                  </tr>
                </tbody>
              </table>
            </Popup>
          </Polyline>
        )
      }

      return arr
    }, [])

    const bounds = this.boundingBox()

    let loadingMsg = null

    if (loading) {
      const outerDivStyle: CSSProperties = {position: 'absolute', zIndex: 5000, width: '100%', textAlign: 'center'}
      const innerDivStyle: CSSProperties = {position: 'relative'}

      loadingMsg = (
        <div style={outerDivStyle}>
          <div style={innerDivStyle}>
            <span className='badge bg-secondary mt-2 py-2 px-2'>
              <span className='me-2'>Loading...</span><FontAwesomeIcon icon={faSpinner} spin={true}/>
            </span>
          </div>
        </div>
      )
    }

    return (
      <div>
        {loadingMsg}
        <MapContainer
          style={{'height': '100vw', 'maxHeight': '100vh'}}
          scrollWheelZoom={false}
          bounds={bounds}
        >
          <FitBounds bounds={bounds}/>

          <LayersControl position="topright">

            <LayersControl.BaseLayer name="OpenStreetMap" checked={true}>
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="OpenStreetMap B&amp;W">
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="WikiMedia">
              <TileLayer
                attribution='<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
                url='https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png'
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              />
            </LayersControl.BaseLayer>
    
            <LayersControl.Overlay name="Relief shading">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors"></a>'
                url="https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png"
              />
            </LayersControl.Overlay>

          </LayersControl>
          {mapPolyLines}
        </MapContainer>
      </div>
    )
  }

}
