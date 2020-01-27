import React, { Component } from 'react'
import { Map, TileLayer, Polyline, Popup } from 'react-leaflet'
import { LatLngBounds } from 'leaflet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import StravaContext from './StravaContext'

export default class RouteMap extends Component {
  static contextType = StravaContext

  constructor(props) {
    super(props)

    var mapCentre = process.env.REACT_APP_MAP_CENTRE.split(',').map(parseFloat)

    // Initial state
    this.state = {
      loading: false,
      polyLines: [],
      mapCentre
    }

    this.defaultMinMax(this.state)
  }

  routesChanged = () => {
    var { routes } = this.props
    var { loading, polyLines } = this.state

    var changed = false

    if (!loading) {
      if (routes.length !== polyLines.length) {
        changed = true
      } else {
        for(var i = 0; i < routes.length; i++) {
          if (routes[i].routeid !== polyLines[i].routeid) {
            changed = true
            break
          }
        }  
      }
    }

    if (changed) {
      setImmediate(this.getPolyLines)
    }
  }

  defaultMinMax = (state) => {
    var { mapCentre } = this.state

    state.minLat = mapCentre[0]
    state.maxLat = mapCentre[0]
    state.minLon = mapCentre[1]
    state.maxLon = mapCentre[1]

    state.minDist = 0
    state.maxDist = 0
  }

  boundingBox = () => {
    var { minLat, minLon, maxLat, maxLon } = this.state

    var latDiff = maxLat - minLat
    var lonDiff = maxLon - minLon

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
    var { routes } = this.props

    this.setState({
      loading: true
    })

    // Create new polylines array
    var polyLines = routes.map((r) => {
      return {
        routeid: r.routeid,
        distance: r.distance,
        name: r.name,
        polyLine: null
      }
    })

    // Load all route summary polylines
    var promises = polyLines.map((r) => {
      return this.context.getCachedSummaryPolyLine(r.routeid)
    })

    // Wait for them all to finish
    var results = await Promise.allSettled(promises)

    // Set new state
    var newState = {
      loading: false
    }

    this.defaultMinMax(newState)

    // Build polyline array
    polyLines = polyLines.map((p, i) => {
      if (results[i].status === 'fulfilled' && results[i].value) {
        p.polyLine = results[i].value
      }
      return p
    })

    // Calculate bounding box
    polyLines.reduce((newState, pl) => {
      if (pl.polyLine) {
        newState = pl.polyLine.reduce((newState, p) => {
          if (p[0] < newState.minLat) newState.minLat = p[0]
          if (p[0] > newState.maxLat) newState.maxLat = p[0]
          if (p[1] < newState.minLon) newState.minLon = p[1]
          if (p[1] > newState.maxLon) newState.maxLon = p[1]  

          return newState
        }, newState)

        if (newState.minDist === 0 || pl.distance < newState.minDist) newState.minDist = pl.distance
        if (pl.distance > newState.maxDist) newState.maxDist = pl.distance
      }

      return newState
    }, newState)

    newState.polyLines = polyLines

    this.setState(newState)
  }

  render = () => {
    var { polyLines, loading, maxDist, minDist } = this.state
    var mapPolyLines
    var mapProps = {
      scrollWheelZoom: false
    }

    this.routesChanged()

    var distRange = maxDist - minDist

    mapPolyLines = polyLines.reduce((arr, p, i) => {
      if (p.polyLine) {
        var distRatio = (distRange === 0 ? 1 : ((p.distance - minDist) / distRange)) * 512

        var red = Math.min(255, distRatio)
        var green = Math.min(255, 512 - distRatio)

        var colour = `rgb(${red},${green},0)`

        arr.push(
          <Polyline key={i} color={colour} positions={p.polyLine}>
            <Popup>{p.name}</Popup>
          </Polyline>
        )
      }

      return arr
    }, [])

    mapProps.bounds = this.boundingBox()

    var loadingMsg = null

    if (loading) {
      loadingMsg = (
        <div style={{'position': 'absolute', 'zIndex': '5000', 'width': '100%', 'textAlign': 'center'}}>
          <div style={{'position': 'relative'}}>
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
