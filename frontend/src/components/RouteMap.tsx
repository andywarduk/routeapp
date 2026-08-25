import { CSSProperties, useContext, useEffect, useRef, useState } from 'react'
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

interface IPolyLine {
  routeid: number
  distance: number
  elevation_gain: number
  name: string
  polyLine: null | LatLngTuple[]
}

// Map centre

const mapCentreEnv = (import.meta.env.VITE_MAP_CENTRE || '').split(',').map(parseFloat)

const mapCentre: LatLngTuple = (mapCentreEnv.length === 2 ? [mapCentreEnv[0], mapCentreEnv[1]] : [0, 0])

const defaultMinMax = (): MinMax => {
  return {
    minLat: mapCentre[0],
    maxLon: mapCentre[1],

    maxLat: mapCentre[0],
    minLon: mapCentre[1],

    minDist: 0,
    maxDist: 0,

    count: 0
  }
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

// Component

export default function RouteMap({ routes }: IProps) {
  const { getCachedSummaryPolyLine } = useContext(StravaContext)

  const [loading, setLoading] = useState(false)
  const [polyLines, setPolyLines] = useState<IPolyLine[]>([])
  const [minMax, setMinMax] = useState<MinMax>(defaultMinMax)

  // The routes already loaded, kept in a ref so that a load which is already
  // running is never restarted from underneath itself
  const loadedRoutes = useRef<IPolyLine[]>([])
  const loadRunning = useRef(false)

  // Bumped once a load finishes, so that routes which changed while it was
  // running get picked up
  const [loadCount, setLoadCount] = useState(0)

  // Fetch the summary polylines whenever the set of routes changes
  useEffect(() => {
    if (loadRunning.current) return

    // Compare routes with the polylines already loaded
    let changed = false

    if (routes.length !== loadedRoutes.current.length) {
      changed = true
    } else {
      for (let i = 0; i < routes.length; i++) {
        if (routes[i].routeid !== loadedRoutes.current[i].routeid) {
          changed = true
          break
        }
      }
    }

    if (!changed) return

    const getPolyLines = async () => {
      loadRunning.current = true
      setLoading(true)

      // Create new polylines array
      const newPolyLines = routes.map((r): IPolyLine => {
        return {
          routeid: r.routeid,
          distance: r.distance,
          elevation_gain: r.elevation_gain,
          name: r.name,
          polyLine: null
        }
      })

      // Load all route summary polylines
      const promises = newPolyLines.map((r) => {
        return getCachedSummaryPolyLine(r.routeid)
      })

      // Process results
      for (let i = 0; i < promises.length; i++) {
        const p = promises[i]
        const pl = newPolyLines[i]

        try {
          pl.polyLine = await p
        } catch {
          pl.polyLine = null
        }
      }

      const newMinMax = defaultMinMax()

      // Calculate bounding box
      for (const pl of newPolyLines) {
        if (pl.polyLine && Array.isArray(pl.polyLine)) {
          for (const p of pl.polyLine) {
            if (newMinMax.count === 0) {
              newMinMax.minLat = p[0]
              newMinMax.maxLat = p[0]
              newMinMax.minLon = p[1]
              newMinMax.maxLon = p[1]
            } else {
              if (p[0] < newMinMax.minLat) newMinMax.minLat = p[0]
              if (p[0] > newMinMax.maxLat) newMinMax.maxLat = p[0]
              if (p[1] < newMinMax.minLon) newMinMax.minLon = p[1]
              if (p[1] > newMinMax.maxLon) newMinMax.maxLon = p[1]
            }

            newMinMax.count++
          }
        }

        if (newMinMax.minDist === 0 || pl.distance < newMinMax.minDist) newMinMax.minDist = pl.distance
        if (pl.distance > newMinMax.maxDist) newMinMax.maxDist = pl.distance
      }

      // Set the new state
      loadedRoutes.current = newPolyLines
      loadRunning.current = false

      setPolyLines(newPolyLines)
      setMinMax(newMinMax)
      setLoading(false)
      setLoadCount((c) => c + 1)
    }

    getPolyLines()
  }, [routes, getCachedSummaryPolyLine, loadCount])

  const boundingBox = () => {
    let { minLat, minLon, maxLat, maxLon } = minMax

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

  const { minDist, maxDist } = minMax

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

  const bounds = boundingBox()

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
