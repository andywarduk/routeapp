import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt, faExclamationTriangle, faCheck } from '@fortawesome/free-solid-svg-icons'

import StravaContext from './StravaContext'
import StravaService from '../StravaService'
import RouteService from '../RouteService'

export default class AddRoutesRow extends Component {
  static contextType = StravaContext

  STATUS_ERRORED = 0
  STATUS_PENDING = 1
  STATUS_CHECKING = 2
  STATUS_FETCHED = 3
  STATUS_FINISHED = 4

  constructor(props) {
    super(props)

    this.state = {
      status: this.STATUS_PENDING,
      desc: '',
      stravaRoute: null
    }

    this.stravaService = new StravaService()
    this.routeService = new RouteService()
  }

  downloadRoute = async () => {
    var { route, finishNotify } = this.props
    var { jwt } = this.context.auth

    try {
      var res = await this.stravaService.route(jwt, route.routeid)

      if (res.ok) {
        this.setState({
          status: this.STATUS_FETCHED,
          stravaRoute: res.data,
          desc: res.data.name || ''
        })

        await this.uploadRoute()

      } else {
        this.setState({
          status: this.STATUS_ERRORED,
          desc: res.data.toString()
        })
        finishNotify(route.routeid)

      }

    } catch(err) {
      this.setState({
        status: this.STATUS_ERRORED,
        desc: err.toString()
      })
      finishNotify(route.routeid)

    }

  }

  uploadRoute = async () => {
    var { route, finishNotify } = this.props
    var { stravaRoute } = this.state
    var { jwt } = this.context.auth

    try {
      var res = await this.routeService.upsert(jwt, route.routeid, stravaRoute)

      if (res.ok) {
        this.setState({
          status: this.STATUS_FINISHED
        })
        finishNotify(route.routeid)

      } else {
        this.setState({
          status: this.STATUS_ERRORED,
          desc: res.data.toString()
        })
        finishNotify(route.routeid)

      }

    } catch(err) {
      this.setState({
        status: this.STATUS_ERRORED,
        desc: err.toString()
      })
      finishNotify(route.routeid)

    }

  }

  statusBadge = () => {
    var { status } = this.state

    var icon
    var colour
    var desc

    switch(status) {
      case this.STATUS_PENDING:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Downloading'
        break

      case this.STATUS_FETCHED:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Uploading'
        break

      case this.STATUS_FINISHED:
        icon = <FontAwesomeIcon icon={faCheck} spin={false}/>
        colour = 'primary'
        desc = 'Finished'
        break

      default:
        icon = <FontAwesomeIcon icon={faExclamationTriangle} spin={false}/>
        colour = 'danger'
        desc = 'Errored'
        break

    }

    var classes = [
      'badge',
      `badge-${colour}`,
      'btn-sm',
      'text-nowrap'
    ]

    var badgeStyle = {
      width: '110px'
    }

    return (
      <span
        className={classes.join(' ')}
        style={badgeStyle}
      >
        {icon}
        <span className='ml-2'>{desc}</span>
      </span>
    )

  }

  componentDidMount = () => {
    this.downloadRoute()
  }

  componentWillUnmount = () => {
    // TODO cancel any pending async
  }

  render = () => {
    var { route } = this.props
    var { desc } = this.state

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
        <td>{desc}</td>
        <td>{this.statusBadge()}</td>
      </tr>
    )
  }

}