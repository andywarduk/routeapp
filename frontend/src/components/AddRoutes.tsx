import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react'

import AddRoutesRow from './AddRoutesRow'

// Types

enum EStatus {
  STATE_INPUT = 1,
  STATE_PROCESSING = 2
}

interface IRoute {
  routeid: number
}

// Component

export default function AddRoutes() {
  const [status, setStatus] = useState(EStatus.STATE_INPUT)
  const [routeList, setRouteList] = useState('')
  const [routes, setRoutes] = useState<IRoute[]>([])

  // Which rows have reported back. Held outside of state - the rows are not
  // redrawn when one finishes, only when the last one does
  const processed = useRef<Set<number>>(new Set())

  // Rows report in from an async callback, so the current list is read from a
  // ref rather than from a stale closure
  const routesRef = useRef<IRoute[]>(routes)

  useEffect(() => {
    routesRef.current = routes
  }, [routes])

  const process = (evt: SyntheticEvent) => {
    evt.preventDefault()

    const routeStrings = routeList.split('\n')

    const newRoutes = routeStrings.reduce((arr: IRoute[], rs) => {
      const rm = rs.match(/[0-9]*$/)

      if (rm){
        const r = rm[0]

        if (r && r !== '') {
          const ri = parseInt(r)
          if (ri > 0) arr.push({
            routeid: ri
          })
        }
      }

      return arr
    }, [])

    setStatus(EStatus.STATE_PROCESSING)
    setRoutes(routes.concat(newRoutes))
  }

  const routeListChanged = (evt: SyntheticEvent<HTMLTextAreaElement>) => {
    setRouteList(evt.currentTarget.value)
  }

  const finishNotify = useCallback((routeid: number) => {
    const elem = routesRef.current.find((r) => r.routeid === routeid)

    if (elem) {
      processed.current.add(routeid)

      // All processed?
      const firstProc = routesRef.current.find((r) => !processed.current.has(r.routeid))

      if (!firstProc) {
        // Yes - allow new input
        setStatus(EStatus.STATE_INPUT)
        setRouteList('')
      }
    }
  }, [])

  let routeTable = null

  if (routes.length > 0) {
    const rows = routes.map(r => {
      return <AddRoutesRow route={r} key={r.routeid} finishNotify={finishNotify}/>
    })

    routeTable = (
      <table className='table table-sm mt-2'>
        <thead>
          <tr>
            <th className='text-nowrap'>Link</th>
            <th className='text-nowrap'>Description</th>
            <th className='text-nowrap'>Status</th>
          </tr>
        </thead>

        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  return (
    <>
      <form className='mt-2'>
        <div className="mb-3">
          <label htmlFor="routeList">Enter list of route IDs or strava route URLs:</label>
          <textarea
            className="form-control"
            id="routeList"
            rows={6}
            value={routeList}
            onChange={(evt) => routeListChanged(evt)}
            disabled={status !== EStatus.STATE_INPUT}
          />
        </div>
        <div className="mb-3">
          <button
            type='submit'
            className='btn btn-primary'
            onClick={(evt) => process(evt)}
            disabled={status !== EStatus.STATE_INPUT}
          >
            Process
          </button>
        </div>
      </form>

      {routeTable}
    </>
  )
}
