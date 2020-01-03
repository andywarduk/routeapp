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

  filterChanged = (filter) => {
    this.requestData({
      filter
    })
  }

  render() {
    var count
    var table = null

    var routes = this.state.routes || []

    switch (routes.length) {
      case 0:
        count = 'No rows found'
        break
      case 1:
        count = '1 row found'
        break
      default:
        count = `${routes.length} rows found`
        break
    }

    if (routes.length > 0) {
      table = <RouteTable
        routes={routes}
        sortCol={this.state.sortCol}
        sortAsc={this.state.sortAsc}
        sortCb={this.sort}
      />
    }

    return (
      <>
        <Filter filterCb={this.filterChanged}/>
        <p>{count}</p>
        {table}
      </>
    )
  }

}
