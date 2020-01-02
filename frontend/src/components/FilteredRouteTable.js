import React, { Component } from 'react'
import RouteTable from './RouteTable'
import RouteService from '../RouteService'
import Filter from './Filter'

export default class FilteredRouteTable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      routes: [],
      sortCol: 'routeid',
      sortAsc: true,
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
    // TODO filter

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
      }
    })

    // Process results
    if (res.ok) {
      this.setState({
        ...newState,
        routes: res.data
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

  render() {
    var body

    if (Array.isArray(this.state.routes) && this.state.routes.length > 0) {
      body = <RouteTable
        routes={this.state.routes}
        sortCol={this.state.sortCol}
        sortAsc={this.state.sortAsc}
        sortCb={this.sort}
      />
    } else {
      body = <p>No rows</p>
    }

    return (
      <>
        <Filter/>
        {body}
      </>
    )
  }

}
