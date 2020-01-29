import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

import RouteService, { IRoute } from '../RouteService'
import UpdateRoutesRow from './UpdateRoutesRow'
import StravaContext from './StravaContext'
import Permissions from '../Permissions'

// Types

interface IProps {
}

interface IState {
  loading: boolean
  error: null | string
  routes: IRoute[],
  checkAll: boolean
}

// Class definition

export default class UpdateRoutes extends Component<IProps, IState> {
  static contextType = StravaContext

  routeService: RouteService

  constructor(props: IProps) {
    super(props)

    this.state = {
      loading: true,
      error: null,
      routes: [],
      checkAll: false
    }

    this.routeService = new RouteService()
  }

  componentDidMount = async () => {
    const { jwt } = this.context.auth

    // Make request
    const res = await this.routeService.search(jwt, {
      columns: ['routeid', 'name', 'updated_at'],
      sort: {
        column: 'routeid',
        ascending: true
      }
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
        error: res.data.toString(),
        loading: false
      })
    }
  }

  render() {
    const { loading, error, routes, checkAll } = this.state
    const { perms } = this.context.auth

    const permissions = new Permissions(perms)

    if (loading) {
      return (
        <div className='row mt-2'>
          <div className='col'>
            <span className='mr-2'>Loading...</span><FontAwesomeIcon icon={faSpinner} spin={true}/>
            </div>
        </div>
      )
    }

    if (error){
      return (
        <div className='row mt-2'>
          <div className='col'>
            {error}
          </div>
        </div>
      )
    }

    // Heading columns
    const headCols = []

    headCols.push(<th key='id' className='text-nowrap'>Id</th>)
    headCols.push(<th key='name' className='text-nowrap'>Name</th>)

    if (permissions.check('modifyRoutes') || permissions.check('deleteRoutes')) {
      headCols.push(<th key='action' className='text-nowrap'>Action</th>)
    }

    // Rows
    const rows = routes.map(r => {
      return <UpdateRoutesRow route={r} key={r.routeid} autoCheck={checkAll} deleteNotify={this.deleteNotify}/>
    })

    // Check all routes button
    if (permissions.check('checkAllRoutes')) {
      const btnStyle = {
        width: '120px'
      }
    
      rows.unshift(
        <tr key='0'>
          <td></td>
          <td></td>
          <td>
            <button
              type='button'
              className='btn btn-primary btn-sm text-nowrap'
              style={btnStyle}
              key='checkAll'
              disabled={checkAll}
              onClick={this.checkAllRoutes}
            >
              <FontAwesomeIcon icon={faCheckCircle} spin={false}/>
              <span className='ml-2'>Check all</span>
            </button>
          </td>
        </tr>
      )
    }

    return (
      <table className='table table-sm mt-2'>
        <thead>
          <tr>
            {headCols}
          </tr>
        </thead>

        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  checkAllRoutes = () => {
    this.setState({
      checkAll: true
    })
  }

  deleteNotify = (routeid: number) => {
    const { routes } = this.state

    this.setState({
      routes: routes.filter((r) => r.routeid !== routeid)
    })
  }

}