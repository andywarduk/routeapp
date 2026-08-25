import { useCallback, useContext, useEffect, useState } from 'react'
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

// Services

const stravaService = new StravaService()
const routeService = new RouteService()

// Component

export default function UpdateRoutesRow({ route, autoCheck, deleteNotify }: IProps) {
  const { auth } = useContext(StravaContext)

  const [status, setStatus] = useState(Status.STATUS_NEEDSCHECK)
  const [stravaRoute, setStravaRoute] = useState<IStravaRoute | null>(null)

  const { routeid, updated_at } = route

  const checkRoute = useCallback(async () => {
    try {
      if (!auth) throw new Error('Not authorised')

      // Set state to pending
      setStatus(Status.STATUS_PENDING)

      const res = await stravaService.route(auth.jwt, routeid)

      if (res.ok) {
        let newStatus = Status.STATUS_UPTODATE

        if (res.data.updated_at !== updated_at) {
          newStatus = Status.STATUS_OUTOFDATE
        }

        setStravaRoute(res.data)
        setStatus(newStatus)

      } else {
        setStatus(Status.STATUS_ERRORED)

      }

    } catch {
      setStatus(Status.STATUS_ERRORED)

    }

  }, [auth, routeid, updated_at])

  const updateRoute = async () => {
    try {
      if (!auth) throw new Error('Not authorised')
      if (!stravaRoute) throw new Error('No strava route to update')

      // Set state to updating
      setStatus(Status.STATUS_UPDATING)

      const res = await routeService.upsert(auth.jwt, routeid, stravaRoute)

      if (res.ok) {
        setStatus(Status.STATUS_UPTODATE)

      } else {
        setStatus(Status.STATUS_ERRORED)

      }

    } catch {
      setStatus(Status.STATUS_ERRORED)

    }

  }

  const deleteRoute = async () => {
    try {
      if (!auth) throw new Error('Not authorised')

      // Set state to deleting
      setStatus(Status.STATUS_DELETING)

      const res = await routeService.delete(auth.jwt, routeid)

      if (res.ok) {
        deleteNotify(routeid)

      } else {
        setStatus(Status.STATUS_ERRORED)

      }

    } catch {
      setStatus(Status.STATUS_ERRORED)

    }

  }

  /*
   * Kick off the check when the parent asks for all routes to be checked. The
   * check moves the row into its pending state before it awaits the fetch,
   * which is what the set-state-in-effect rule objects to - there is no event
   * to hang it off, the request is triggered by the prop changing.
   */
  useEffect(() => {
    if (autoCheck && status === Status.STATUS_NEEDSCHECK) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      checkRoute()
    }
  }, [autoCheck, status, checkRoute])

  const updateButton = () => {
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
        action = checkRoute
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
        action = updateRoute
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
        <span className='ms-2'>{desc}</span>
      </button>
    )
  }

  const deleteButton = () => {
    const classes = [
      'btn',
      `btn-danger`,
      'btn-sm',
      'text-nowrap',
      'ms-1'
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
        onClick={deleteRoute}
      >
        <FontAwesomeIcon icon={faTrash} spin={false}/>
        <span className='ms-2'>Delete</span>
      </button>
    )
  }

  if (!auth) return <></>

  const { perms } = auth

  const buttons = []

  const permissions = new Permissions(perms)

  if (permissions.check('modifyRoutes')) {
    buttons.push(updateButton())
  }

  if (permissions.check('deleteRoutes')) {
    buttons.push(deleteButton())
  }

  return (
    <tr>
      <td>
        <a
          href={`http://www.strava.com/routes/${routeid}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {routeid}
        </a>
      </td>
      <td>{route.name}</td>
      <td style={{whiteSpace: 'nowrap'}}>{buttons}</td>
    </tr>
  )
}
