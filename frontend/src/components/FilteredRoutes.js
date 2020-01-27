import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faKeyboard } from '@fortawesome/free-solid-svg-icons'

import RouteTable from './RouteTable'
import RouteMap from './RouteMap'
import RouteService from '../RouteService'
import Filter from './Filter'
import StravaContext from './StravaContext'

export default class FilteredRoutes extends Component {
  static contextType = StravaContext

  debounceTime = 400 // 0.4 second debounce

  VIEW_TABLE = 1
  VIEW_MAP = 2

  constructor(props) {
    super(props)

    // Initial state
    this.state = {
      loading: 0,
      request: 0,
      routes: [],
      error: null,
      sortCol: 'routeid',
      sortAsc: true,
      filter: {},
      view: this.VIEW_TABLE,
    }

    // Create route service
    this.routeService = new RouteService()
  }

  componentDidMount = () => {
    // Initial data request
    this.requestData({
      ...this.state
    })
  }

  requestData = async (newState) => {
    var { jwt } = this.context.auth

    // Allocate request number
    var requestNo = this.state.request + 1

    // Set state
    this.setState({
      ...newState,
      loading: this.state.loading + 1,
      request: requestNo
    })

    // Build full state for search
    var srchState = {
      ...this.state,
      ...newState
    }

    // Make request
    var res = await this.routeService.search(jwt, {
      columns: [
        'routeid',
        'name',
        'description',
        'distance',
        'elevation_gain',
        'estimated_moving_time'
      ],
      sort: {
        column: srchState.sortCol,
        ascending: srchState.sortAsc
      },
      filter: srchState.filter
    })

    // Process results
    var nextState

    if (requestNo >= this.state.request) {
      if (res.ok) {
        nextState = {
          routes: res.data,
          error: null,
          loading: Math.max(0, this.state.loading - 1)
        }

      } else {
        nextState = {
          routes: [],
          error: res.data.toString(),
          loading: Math.max(0, this.state.loading - 1)
        }

      }

    } else {
      nextState = {
        loading: Math.max(0, this.state.loading - 1)
      }

    }

    this.setState(nextState)
  }

  sort = (col) => {
    var { sortCol, sortAsc } = this.state

    if (col === sortCol) {
      // Same column - reverse order
      this.requestData({
        sortAsc: !sortAsc
      })
    } else {
      // New column
      this.requestData({
        sortCol: col,
        sortAsc: true
      })
    }
  }

  switchTab = (evt, newTab) => {
    evt.preventDefault()

    this.setState({
      view: newTab
    })
  }

  filterChanged = (filter, debounce) => {
    var { debounceTimer } = this.state

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (debounce) {
      // Debounced request
      this.setState({
        debounceTimer: setTimeout(() => {
          this.filterChanged(filter, false)
        }, this.debounceTime),
        filter
      })
    } else {
      // Immediate request
      this.requestData({
        debounceTimer: null,
        filter
      })
    }
  }

  render = () => {
    var { routes, loading, error, sortCol, sortAsc, debounceTimer, view } = this.state

    var count
    var content = null 

    routes = routes || []

    if (error) {
      count = error.toString()
    } else {
      switch (routes.length) {
        case 0:
          count = 'No routes found'
          break
        case 1:
          count = '1 route found'
          break
        default:
          count = `${routes.length} routes found`
          break
      }
    }

    var spinner = null

    if (loading > 0) {
      spinner = <FontAwesomeIcon icon={faSpinner} spin={true}/>
    } else if (debounceTimer) {
      spinner = <FontAwesomeIcon icon={faKeyboard}/>
    }

    var tabItems = []

    var addTabItem = (type, desc) => {
      var classes = null

      if (type === view) {
        classes = 'nav-link active'
      } else {
        classes = 'nav-link'
      }

      tabItems.push(
        <li key={type} className='nav-item'>
          <a className={classes} href='/' onClick={(evt) => this.switchTab(evt, type)}>{desc}</a>
        </li>
      )
    }

    addTabItem(this.VIEW_TABLE, 'Table')
    addTabItem(this.VIEW_MAP, 'Map')

    var spinnerSpan = null

    if (spinner) {
      spinnerSpan = <span className='mr-2'>{spinner}</span>
    }

    tabItems.push(
      <li key={-1} className='nav-item ml-auto'>
        <a className='nav-link disabled' href='/'>
        {spinnerSpan}<span>{count}</span>
        </a>
      </li>
    )

    var tabs = (
      <ul className='nav nav-tabs mt-2'>
        {tabItems}
      </ul>
    )

    switch (view) {
    case this.VIEW_TABLE:
      if (routes.length > 0) {
        content = <RouteTable
          routes={routes}
          sortCol={sortCol}
          sortAsc={sortAsc}
          sortCb={this.sort}
        />
      }

      break

    case this.VIEW_MAP:
      content = (
        <RouteMap routes={routes}/>
      )

      break

    default:
      break

    }

    return (
      <>
        <Filter filterCb={this.filterChanged}/>
        {tabs}
        {content}
      </>
    )
  }

}
