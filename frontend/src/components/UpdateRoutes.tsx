import { useCallback, useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

import RouteService, { IRoute } from '../RouteService'
import UpdateRoutesRow from './UpdateRoutesRow'
import StravaContext from './StravaContext'
import Permissions from '../Permissions'

// Service

const routeService = new RouteService()

// Component

export default function UpdateRoutes() {
  const { auth } = useContext(StravaContext)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<IRoute[]>([])
  const [checkAll, setCheckAll] = useState(false)

  const jwt = auth ? auth.jwt : null

  useEffect(() => {
    if (!jwt) return

    const loadRoutes = async () => {
      // Make request
      const res = await routeService.search(jwt, {
        columns: ['routeid', 'name', 'updated_at'],
        sort: {
          column: 'routeid',
          ascending: true
        }
      })

      // Process results
      if (res.ok) {
        setRoutes(res.data)
        setError(null)
      } else {
        setError(res.data.toString())
      }

      setLoading(false)
    }

    loadRoutes()
  }, [jwt])

  const deleteNotify = useCallback((routeid: number) => {
    setRoutes((current) => current.filter((r) => r.routeid !== routeid))
  }, [])

  if (!auth) return <></>

  const { perms } = auth

  const permissions = new Permissions(perms)

  if (loading) {
    return (
      <div className='row mt-2'>
        <div className='col'>
          <span className='me-2'>Loading...</span><FontAwesomeIcon icon={faSpinner} spin={true}/>
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
    return <UpdateRoutesRow route={r} key={r.routeid} autoCheck={checkAll} deleteNotify={deleteNotify}/>
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
            onClick={() => setCheckAll(true)}
          >
            <FontAwesomeIcon icon={faCheckCircle} spin={false}/>
            <span className='ms-2'>Check all</span>
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
