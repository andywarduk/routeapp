import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faSyncAlt, faSave, faExclamationTriangle, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'

import StravaContext from './StravaContext'
import StravaService from '../StravaService'
import RouteService from '../RouteService'
import Permissions from '../Permissions'

export default class UpdateRoutesRow extends Component {
  static contextType = StravaContext

  STATUS_ERRORED = -1
  STATUS_NEEDSCHECK = 0
  STATUS_PENDING = 1
  STATUS_UPTODATE = 2
  STATUS_OUTOFDATE = 3
  STATUS_DELETING = 4
  STATUS_UPDATING = 5

  constructor(props) {
    super(props)

    this.state = {
      status: this.STATUS_NEEDSCHECK,
      error: null,
      stravaRoute: null
    }

    this.stravaService = new StravaService()
    this.routeService = new RouteService()
  }

  checkRoute = async () => {
    var { route } = this.props
    var { jwt } = this.context

    try {
      // Set state to pending
      this.setState({
        status: this.STATUS_PENDING,
      })

      var res = await this.stravaService.route(jwt, route.routeid)

      if (res.ok) {
        var status = this.STATUS_UPTODATE
        var stravaRoute = res.data
  
        debugger
        if (stravaRoute.updated_at !== route.updated_at) {
          status = this.STATUS_OUTOFDATE
        }
  
        this.setState({
          status,
          stravaRoute
        })
  
      } else {
        this.setState({
          status: this.STATUS_ERRORED,
          error: res.data.toString()
        })
  
      }
  
    } catch(err) {
      this.setState({
        status: this.STATUS_ERRORED,
        error: err.toString()
      })

    }

  }

  updateRoute = async () => {
    var { jwt } = this.context
    var { stravaRoute } = this.state
    var { route } = this.props

    try {
      // Set state to updating
      this.setState({
        status: this.STATUS_UPDATING
      })

      var res = await this.routeService.upsert(jwt, route.routeid, stravaRoute)

      if (res.ok) {
        this.setState({
          status: this.STATUS_UPTODATE
        })
  
      } else {
        this.setState({
          status: this.STATUS_ERRORED,
          error: res.data.toString()
        })
  
      }
  
    } catch(err) {
      this.setState({
        status: this.STATUS_ERRORED,
        error: err.toString()
      })

    }

  }

  updateButton = () => {
    var { status } = this.state

    var icon
    var colour
    var enabled = false
    var desc
    var action

    switch(status) {
      case this.STATUS_NEEDSCHECK:
        icon = <FontAwesomeIcon icon={faCheckCircle} spin={false}/>
        colour = 'primary'
        desc = 'Needs check'
        enabled = true
        action = this.checkRoute
        break

      case this.STATUS_PENDING:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Checking'
        break

      case this.STATUS_UPTODATE:
        icon = <FontAwesomeIcon icon={faCheck} spin={false}/>
        colour = 'success'
        desc = 'Up to date'
        break

      case this.STATUS_OUTOFDATE:
        icon = <FontAwesomeIcon icon={faSave} spin={false}/>
        colour = 'warning'
        desc = 'Update'
        enabled = true
        action = this.updateRoute
        break

      case this.STATUS_DELETING:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Deleting'
        break

      case this.STATUS_UPDATING:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Updating'
        break
  
      default:
        icon = <FontAwesomeIcon icon={faExclamationTriangle} spin={false}/>
        colour = 'danger'
        desc = 'Errored'
        break

    }

    var classes = [
      'btn',
      `btn-${colour}`,
      'btn-sm',
      'text-nowrap'
    ]

    var btnStyle = {
      width: '120px'
    }

    return (
      <button
        type='button'
        className={classes.join(' ')}
        style={btnStyle}
        key='update'
        disabled={!enabled}
        onClick={action}
      >
        {icon}
        <span className='ml-2'>{desc}</span>
      </button>
    )
  }

  deleteButton = () => {
    var { status } = this.state

    var classes = [
      'btn',
      `btn-danger`,
      'btn-sm',
      'text-nowrap',
      'ml-1'
    ]

    var btnStyle = {
      width: '120px'
    }

    return (
      <button
        type='button'
        className={classes.join(' ')}
        style={btnStyle}
        key='delete'
        disabled={status === this.STATUS_DELETING || status === this.STATUS_ERRORED}
        onClick={this.deleteRoute}
      >
        <FontAwesomeIcon icon={faTrash} spin={false}/>
        <span className='ml-2'>Delete</span>
      </button>
    )
  }

  deleteRoute = async () => {
    var { route, deleteNotify } = this.props
    var { jwt } = this.context

    try {
      // Set state to deleting
      this.setState({
        status: this.STATUS_DELETING,
      })

      var res = await this.routeService.delete(jwt, route.routeid)

      if (res.ok) {
        deleteNotify(route.routeid)
  
      } else {
        this.setState({
          status: this.STATUS_ERRORED,
          error: res.data.toString()
        })
  
      }
  
    } catch(err) {
      this.setState({
        status: this.STATUS_ERRORED,
        error: err.toString()
      })

    }

  }

  componentWillUnmount = () => {
    // TODO cancel any pending async
  }

  render = () => {
    var { route, autoCheck } = this.props
    var { status } = this.state
    var { perms } = this.context

    var buttons = []

    var permissions = new Permissions(perms)

    if (autoCheck && status === this.STATUS_NEEDSCHECK) {
      setImmediate(() => {
        this.checkRoute()
      })
    }

    if (permissions.check('modifyRoutes')) {
      buttons.push(this.updateButton())
    }

    if (permissions.check('deleteRoutes')) {
      buttons.push(this.deleteButton())
    }

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
        <td style={{whiteSpace: 'nowrap'}}>{buttons}</td>
      </tr>
    )
  }

}