import { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt, faExclamationTriangle, faCheck } from '@fortawesome/free-solid-svg-icons'

import StravaContext from './StravaContext'
import StravaService, { IStravaRoute } from '../StravaService'
import RouteService, { IRoute } from '../RouteService'

// Types

enum EStatus {
  STATUS_ERRORED = 0,
  STATUS_PENDING = 1,
  STATUS_CHECKING = 2,
  STATUS_FETCHED = 3,
  STATUS_FINISHED = 4
}

interface IProps {
  route: IRoute
  finishNotify: (routeid: number) => void
}

interface IState {
  status: EStatus
  desc: string
  stravaRoute: IStravaRoute | null
}

// Class definition

export default class AddRoutesRow extends Component<IProps, IState> {
  static contextType: typeof StravaContext = StravaContext
  context!: React.ContextType<typeof StravaContext>

  stravaService: StravaService
  routeService: RouteService

  constructor(props: IProps) {
    super(props)

    this.state = {
      status: EStatus.STATUS_PENDING,
      desc: '',
      stravaRoute: null
    }

    this.stravaService = new StravaService()
    this.routeService = new RouteService()
  }

  downloadRoute = async () => {
    const { route, finishNotify } = this.props
    const { auth } = this.context

    try {
      if (!auth) throw new Error('Not authenticated')

      const { jwt } = auth

      const res = await this.stravaService.route(jwt, route.routeid)

      if (res.ok) {
        this.setState({
          status: EStatus.STATUS_FETCHED,
          stravaRoute: res.data,
          desc: res.data.name || ''
        })

        await this.uploadRoute()

      } else {
        this.setState({
          status: EStatus.STATUS_ERRORED,
          desc: res.data.toString()
        })
        finishNotify(route.routeid)

      }

    } catch(err) {
      this.setState({
        status: EStatus.STATUS_ERRORED,
        desc: err.toString()
      })
      finishNotify(route.routeid)

    }

  }

  uploadRoute = async () => {
    const { route, finishNotify } = this.props
    const { stravaRoute } = this.state
    const { auth } = this.context

    try {
      if (!stravaRoute) throw new Error('stravaRoute empty')
      if (!auth) throw new Error('Not authenticated')

      const { jwt } = auth

      const res = await this.routeService.upsert(jwt, route.routeid, stravaRoute)

      if (res.ok) {
        this.setState({
          status: EStatus.STATUS_FINISHED
        })
        finishNotify(route.routeid)

      } else {
        this.setState({
          status: EStatus.STATUS_ERRORED,
          desc: res.data.toString()
        })
        finishNotify(route.routeid)

      }

    } catch(err) {
      this.setState({
        status: EStatus.STATUS_ERRORED,
        desc: err.toString()
      })
      finishNotify(route.routeid)

    }

  }

  statusBadge = () => {
    const { status } = this.state

    let icon
    let colour
    let desc

    switch(status) {
      case EStatus.STATUS_PENDING:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Downloading'
        break

      case EStatus.STATUS_FETCHED:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        desc = 'Uploading'
        break

      case EStatus.STATUS_FINISHED:
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

    const classes = [
      'badge',
      `badge-${colour}`,
      'btn-sm',
      'text-nowrap'
    ]

    const badgeStyle = {
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
    const { route } = this.props
    const { desc } = this.state

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