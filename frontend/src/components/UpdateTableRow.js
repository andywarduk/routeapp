import React, { Component } from 'react'

import StravaContext from './StravaContext'
import StravaService from '../StravaService'

export default class UpdateTable extends Component {
  static contextType = StravaContext

  STATUS_ERRORED = -1
  STATUS_PENDING = 0
  STATUS_UPTODATE = 1
  STATUS_OUTOFDATE = 2

  constructor(props) {
    super(props)

    this.state = {
      status: this.STATUS_PENDING,
      error: null,
      stravaRoute: null
    }

    this.stravaService = new StravaService()
  }

  badge = (text, colour) => {
    var classStr = (colour ? `badge badge-${colour}` : 'badge')
    return <span className={classStr}>{text}</span>
  }

  statusDesc = (status) => {
    switch(status) {
      case this.STATUS_PENDING:
        return this.badge('Pending', 'secondary')
      case this.STATUS_UPTODATE:
        return this.badge('Up to date', 'success')
      case this.STATUS_OUTOFDATE:
        return this.badge('Out of date', 'warning')
      default:
        return this.badge('Error', 'danger')
    }
  }

  componentDidMount = async () => {
    var { route } = this.props

    try {
      var res = await this.stravaService.route(this.context, route.routeid)

      if (res.ok) {
        var status = this.STATUS_UPTODATE
        var stravaRoute = res.data
  
        if (stravaRoute.updatedAt !== route.updatedAt) {
          status = this.STATUS_OUTOFDATE
        }
  
        this.setState({
          status,
          stravaRoute
        })
  
      } else {
        this.setState({
          status: this.STATUS_ERRORED,
          error: res.data
        })
  
      }
  
    } catch(err) {
      this.setState({
        status: this.STATUS_ERRORED,
        error: err
      })

    }

  }

  render = () => {
    var { route } = this.props
    var { status } = this.state

    return (
      <tr>
        <td>
          <a
            href={`http://www.strava.com/routes/${route.routeid}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {route.routeid}
          </a>
        </td>
        <td>{route.name}</td>
        <td>{this.statusDesc(status)}</td>
      </tr>
    )
  }

}