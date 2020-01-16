import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import RouteService from '../RouteService'
import UpdateRoutesRow from './UpdateRoutesRow'
import StravaContext from './StravaContext'

export default class UpdateRoutes extends Component {
  static contextType = StravaContext

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      error: null,
      routes: []
    }

    this.routeService = new RouteService()
  }

  componentDidMount = async () => {
    // Make request
    var res = await this.routeService.search(this.context.jwt, {
      columns: ['routeid', 'name', 'updatedAt']
    })

    // Process results
    if (res.ok) {
      this.setState({
        routes: res.data,
        error: null,
        loading: false
      })
    } else {
      this.setState({
        error: res.data,
        loading: false
      })
    }
  }

  render() {
    var { loading, error, routes } = this.state

    if (loading) {
      return (
        <div className='row'>
          <div className='col'>
            <span className='mr-2'>Loading...</span><FontAwesomeIcon icon={faSpinner} spin={true}/>
            </div>
        </div>
      )

    } else if (error){
      return (
        <div className='row'>
          <div className='col'>
            {this.error}
          </div>
        </div>
      )

    }

    var rows = routes.map(r => {
      return <UpdateRoutesRow route={r} key={r.routeid} />
    })

    return (
      <table className='table table-sm mt-2'>
        <thead>
          <tr>
            <th className='text-nowrap'>Id</th>
            <th className='text-nowrap'>Name</th>
            <th className='text-nowrap'>Status</th>
          </tr>
        </thead>

        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

}