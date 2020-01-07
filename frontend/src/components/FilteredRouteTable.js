import React, { Component } from 'react'
import { Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import RouteTable from './RouteTable'
import RouteService from '../RouteService'
import Filter from './Filter'

export default class FilteredRouteTable extends Component {

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
    if (col === this.state.sortCol) {
      // Same column - reverse order
      this.requestData({
        sortAsc: !this.state.sortAsc
      })
    } else {
      // New column
      this.requestData({
        sortCol: col,
        sortAsc: true
      })
    }
  }

  filterChanged = (filter) => {
    this.requestData({
      filter
    })
  }

  render() {
    var count
    var table = null

    var routes = this.state.routes || []

    if (this.state.error) {
      count = this.state.error.toString()
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
        sortCol={this.state.sortCol}
        sortAsc={this.state.sortAsc}
        sortCb={this.sort}
      />
    }

    var spinner = null

    if (this.state.loading > 0) spinner = <FontAwesomeIcon icon={faSpinner} spin={true} />

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
