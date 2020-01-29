import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faSyncAlt, faSave, faExclamationTriangle, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'

import StravaContext from './StravaContext'
import StravaService, { IStravaRoute } from '../StravaService'
import RouteService, { IRoute } from '../RouteService'
import Permissions from '../Permissions'

// Types

enum Status {
  STATUS_ERRORED = -1,
  STATUS_NEEDSCHECK = 0,
  STATUS_PENDING = 1,
  STATUS_UPTODATE = 2,
  STATUS_OUTOFDATE = 3,
  STATUS_DELETING = 4,
  STATUS_UPDATING = 5
}

interface IProps {
  route: IRoute
  autoCheck: boolean
  deleteNotify: (routeid: number) => void
}

interface IState {
  status: Status
  stravaRoute: IStravaRoute | null
  error: string | null
}

// Class definition

export default class UpdateRoutesRow extends Component<IProps, IState> {
  static contextType = StravaContext

  stravaService: StravaService
  routeService: RouteService

  constructor(props: IProps) {
    super(props)

    this.state = {
      status: Status.STATUS_NEEDSCHECK,
      error: null,
      stravaRoute: null
    }

    this.stravaService = new StravaService()
    this.routeService = new RouteService()
  }

  checkRoute = async () => {
    const { route } = this.props
    const { jwt } = this.context.auth

    try {
      // Set state to pending
      this.setState({
        status: Status.STATUS_PENDING,
      })

      const res = await this.stravaService.route(jwt, route.routeid)

      if (res.ok) {
        let status = Status.STATUS_UPTODATE
        const stravaRoute = res.data
  
        if (stravaRoute.updated_at !== route.updated_at) {
          status = Status.STATUS_OUTOFDATE
        }
  
        this.setState({
          status,
          stravaRoute
        })
  
      } else {
        this.setState({
          status: Status.STATUS_ERRORED,
          error: res.data.toString()
        })
  
      }
  
    } catch(err) {
      this.setState({
        status: Status.STATUS_ERRORED,
        error: err.toString()
      })

    }

  }

  updateRoute = async () => {
    const { jwt } = this.context.auth
    const { stravaRoute } = this.state
    const { route } = this.props

    try {
      if (!stravaRoute) throw new Error('No strava route to update')

      // Set state to updating
      this.setState({
        status: Status.STATUS_UPDATING
      })

      const res = await this.routeService.upsert(jwt, route.routeid, stravaRoute)

      if (res.ok) {
        this.setState({
          status: Status.STATUS_UPTODATE
        })
  
      } else {
        this.setState({
          status: Status.STATUS_ERRORED,
          error: res.data.toString()
        })
  
      }
  
    } catch(err) {
      this.setState({
        status: Status.STATUS_ERRORED,
        error: err.toString()
      })

    }

  }

  updateButton = () => {
    const { status } = this.state

    let icon
    let colour
    let enabled = false
    let desc
    let action

    switch(status) {
      case Status.STATUS_NEEDSCHECK:
        icon = <FontAwesomeIcon icon={faCheckCircle} spin={false}/>
        colour = 'primary'
        desc = 'Needs check'
        enabled = true
        action = this.checkRoute
        break

      case Status.STATUS_PENDING:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Checking'
        break

      case Status.STATUS_UPTODATE:
        icon = <FontAwesomeIcon icon={faCheck} spin={false}/>
        colour = 'success'
        desc = 'Up to date'
        break

      case Status.STATUS_OUTOFDATE:
        icon = <FontAwesomeIcon icon={faSave} spin={false}/>
        colour = 'warning'
        desc = 'Update'
        enabled = true
        action = this.updateRoute
        break

      case Status.STATUS_DELETING:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Deleting'
        break

      case Status.STATUS_UPDATING:
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

    const classes = [
      'btn',
      `btn-${colour}`,
      'btn-sm',
      'text-nowrap'
    ]

    const btnStyle = {
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
    const { status } = this.state

    const classes = [
      'btn',
      `btn-danger`,
      'btn-sm',
      'text-nowrap',
      'ml-1'
    ]

    const btnStyle = {
      width: '120px'
    }

    return (
      <button
        type='button'
        className={classes.join(' ')}
        style={btnStyle}
        key='delete'
        disabled={status === Status.STATUS_DELETING || status === Status.STATUS_ERRORED}
        onClick={this.deleteRoute}
      >
        <FontAwesomeIcon icon={faTrash} spin={false}/>
        <span className='ml-2'>Delete</span>
      </button>
    )
  }

  deleteRoute = async () => {
    const { route, deleteNotify } = this.props
    const { jwt } = this.context.auth

    try {
      // Set state to deleting
      this.setState({
        status: Status.STATUS_DELETING,
      })

      const res = await this.routeService.delete(jwt, route.routeid)

      if (res.ok) {
        deleteNotify(route.routeid)
  
      } else {
        this.setState({
          status: Status.STATUS_ERRORED,
          error: res.data.toString()
        })
  
      }
  
    } catch(err) {
      this.setState({
        status: Status.STATUS_ERRORED,
        error: err.toString()
      })

    }

  }

  componentWillUnmount = () => {
    // TODO cancel any pending async
  }

  render = () => {
    const { route, autoCheck } = this.props
    const { status } = this.state
    const { perms } = this.context.auth

    const buttons = []

    const permissions = new Permissions(perms)

    if (autoCheck && status === Status.STATUS_NEEDSCHECK) {
      setTimeout(() => {
        this.checkRoute()
      }, 0)
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