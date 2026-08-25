import { useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt, faExclamationTriangle, faCheck } from '@fortawesome/free-solid-svg-icons'

import StravaContext from './StravaContext'
import StravaService, { IStravaRoute } from '../StravaService'
import RouteService from '../RouteService'
import { toError } from '../Service'

// Types

enum EStatus {
  STATUS_ERRORED = 0,
  STATUS_PENDING = 1,
  STATUS_CHECKING = 2,
  STATUS_FETCHED = 3,
  STATUS_FINISHED = 4
}

interface IProps {
  route: { routeid: number }
  finishNotify: (routeid: number) => void
}

// Services

const stravaService = new StravaService()
const routeService = new RouteService()

// Component

export default function AddRoutesRow({ route, finishNotify }: IProps) {
  const { auth } = useContext(StravaContext)

  const [status, setStatus] = useState(EStatus.STATUS_PENDING)
  const [desc, setDesc] = useState('')

  const { routeid } = route

  // The download runs once per route id; the callback and the token are read
  // through a ref so that neither restarts it
  const latest = useRef({ auth, finishNotify })

  useEffect(() => {
    latest.current = { auth, finishNotify }
  })

  useEffect(() => {
    let cancelled = false

    const uploadRoute = async (stravaRoute: IStravaRoute) => {
      const { auth, finishNotify } = latest.current

      if (!auth) throw new Error('Not authenticated')

      const res = await routeService.upsert(auth.jwt, routeid, stravaRoute)

      if (cancelled) return

      if (res.ok) {
        setStatus(EStatus.STATUS_FINISHED)

      } else {
        setStatus(EStatus.STATUS_ERRORED)
        setDesc(res.data.toString())

      }

      finishNotify(routeid)
    }

    const downloadRoute = async () => {
      try {
        const { auth, finishNotify } = latest.current

        if (!auth) throw new Error('Not authenticated')

        const res = await stravaService.route(auth.jwt, routeid)

        if (cancelled) return

        if (res.ok) {
          setStatus(EStatus.STATUS_FETCHED)
          setDesc(res.data.name || '')

          await uploadRoute(res.data)

        } else {
          setStatus(EStatus.STATUS_ERRORED)
          setDesc(res.data.toString())
          finishNotify(routeid)

        }

      } catch(err) {
        if (cancelled) return

        setStatus(EStatus.STATUS_ERRORED)
        setDesc(toError(err).toString())
        latest.current.finishNotify(routeid)

      }
    }

    downloadRoute()

    return () => {
      cancelled = true
    }
  }, [routeid])

  const statusBadge = () => {
    let icon
    let colour
    let badgeDesc

    switch(status) {
      case EStatus.STATUS_PENDING:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        badgeDesc = 'Downloading'
        break

      case EStatus.STATUS_FETCHED:
        icon = <FontAwesomeIcon icon={faSyncAlt} spin={true}/>
        colour = 'secondary'
        badgeDesc = 'Uploading'
        break

      case EStatus.STATUS_FINISHED:
        icon = <FontAwesomeIcon icon={faCheck} spin={false}/>
        colour = 'primary'
        badgeDesc = 'Finished'
        break

      default:
        icon = <FontAwesomeIcon icon={faExclamationTriangle} spin={false}/>
        colour = 'danger'
        badgeDesc = 'Errored'
        break

    }

    const classes = [
      'badge',
      `bg-${colour}`,
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
        <span className='ms-2'>{badgeDesc}</span>
      </span>
    )

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
      <td>{desc}</td>
      <td>{statusBadge()}</td>
    </tr>
  )
}
