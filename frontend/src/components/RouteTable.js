import React, { Component } from 'react'
import RouteRow from './RouteRow'
import RouteService from '../RouteService'

export default class RouteTable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      routes: []
    }

    this.routeService = new RouteService()
  }

  componentDidMount() {
    this.fillData();
  }

  async fillData() {
    // TODO filter
    var res = await this.routeService.search(null)
    
    if (res.ok) {
      this.setState({
        routes: res.data
      })
    }
  }

  render() {
    var result

    if (Array.isArray(this.state.routes)) {
      var rows = this.state.routes.map(r => {
        return <RouteRow route={r} key={r.routeid} />
      })

      result = (
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
      )

    } else {
      result = <p>No rows</p>

    }

    return result
  }

}
