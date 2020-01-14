import React, { Component } from 'react'
import { Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faKeyboard } from '@fortawesome/free-solid-svg-icons'

import RouteTable from './RouteTable'
import RouteService from '../RouteService'
import Filter from './Filter'

export default class FilteredRouteTable extends Component {

  debounceTime = 400 // 0.4 second debounce

  constructor(props) {
    super(props)

    this.state = {
      loading: 0,
      request: 0,
      routes: [],
      error: null,
      sortCol: 'routeid',
      sortAsc: true,
      filter: {}
    }

    this.routeService = new RouteService()
  }

  componentDidMount = () => {
    // Initial data request
    this.requestData({
      ...this.state
    })
  }

  requestData = async (newState) => {
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
    var res = await this.routeService.search({
      columns: ['routeid', 'name', 'description', 'distance', 'elevation_gain', 'estimated_moving_time'],
      sort: {
        column: srchState.sortCol,
        ascending: srchState.sortAsc
      },
      filter: srchState.filter
    })

    // Process results
    if (requestNo >= this.state.request) {
      if (res.ok) {
        this.setState({
          routes: res.data,
          error: null,
          loading: Math.max(0, this.state.loading - 1)
        })
      } else {
        this.setState({
          routes: [],
          error: res.data,
          loading: Math.max(0, this.state.loading - 1)
        })
      }
    } else {
      this.setState({
        loading: Math.max(0, this.state.loading - 1)
      })
    }
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

  render() {
    var { routes, loading, error, sortCol, sortAsc, debounceTimer } = this.state

    var count
    var table = null

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

    if (routes.length > 0) {
      table = <RouteTable
        routes={routes}
        sortCol={sortCol}
        sortAsc={sortAsc}
        sortCb={this.sort}
      />
    }

    var spinner = null

    if (loading > 0) {
      spinner = <FontAwesomeIcon icon={faSpinner} spin={true}/>
    } else if (debounceTimer) {
      spinner = <FontAwesomeIcon icon={faKeyboard}/>
    }

    return (
      <>
        <Filter filterCb={this.filterChanged}/>
        <Row className='mt-2'>
          <Col>{count}&nbsp;{spinner}</Col>
        </Row>
        {table}
      </>
    )
  }

}
