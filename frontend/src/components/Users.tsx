import { CSSProperties, useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { faSort } from '@fortawesome/free-solid-svg-icons'

import UserService, { IUser } from '../UserService'
import UserRow from './UserRow'
import StravaContext from './StravaContext'

// Service

const userService = new UserService()

// Component

export default function Users() {
  const { auth } = useContext(StravaContext)

  const [users, setUsers] = useState<IUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState('lastname')
  const [sortAsc, setSortAsc] = useState(true)

  const jwt = auth ? auth.jwt : null

  // Load on mount, and again whenever the sort order changes
  useEffect(() => {
    if (!jwt) return

    const loadUsers = async () => {
      const res = await userService.search(jwt, {
        columns: ['athleteid', 'firstname', 'lastname', 'city', 'state', 'country'],
        sort: {
          column: sortCol,
          ascending: sortAsc
        },
        perms: true
      })

      if (res.ok) {
        setUsers(res.data)
      } else {
        setError(res.data.toString())
      }
    }

    loadUsers()
  }, [jwt, sortCol, sortAsc])

  const sort = (col: string) => {
    if (col === sortCol) {
      // Same column - reverse order
      setSortAsc(!sortAsc)
    } else {
      // New column
      setSortCol(col)
      setSortAsc(true)
    }
  }

  if (error) {
    return (
      <div className='row'>
        <div className='col mt-2'>
          {error}
        </div>
      </div>
    )
  }

  const headingCells: React.JSX.Element[] = []
  const colClasses: string[][] = []

  const addHeadingCell = (col: string | null, desc: string, span: number,
    commonClasses: string[], thClasses: string[], tdClasses: string[]) => {
    // Build full class lists
    thClasses = commonClasses.concat(thClasses)
    tdClasses = commonClasses.concat(tdClasses)

    // Save classes for row use
    for (let i = 0; i < span; i++) colClasses.push(tdClasses)

    let th
    const key = headingCells.length

    const style: CSSProperties = {}

    if (col) {
      let icon

      if (col === sortCol) {
        if (sortAsc) {
          icon = <FontAwesomeIcon icon={faSortDown} />
        } else {
          icon = <FontAwesomeIcon icon={faSortUp} />
        }
      } else {
        icon = <FontAwesomeIcon icon={faSort} />
      }

      style.cursor = 'pointer'

      th = <th key={key} className={thClasses.join(' ')} style={style} onClick={() => sort(col)} colSpan={span}>{desc}&nbsp;{icon}</th>

    } else {
      th = <th key={key} className={thClasses.join(' ')} style={style} colSpan={span}>{desc}</th>

    }

    headingCells.push(th)
  }

  // Set up heading cells
  addHeadingCell('id', 'Athlete', 1, ['text-nowrap'], [], [])
  addHeadingCell('firstname', 'First Name', 1, ['text-nowrap'], [], [])
  addHeadingCell('lastname', 'Last Name', 1, ['text-nowrap'], [], [])
  addHeadingCell(null, 'Location', 1, ['d-none', 'd-md-table-cell'], ['text-nowrap'], [])
  addHeadingCell(null, 'Permissions', 1, ['d-none', 'd-md-table-cell'], ['text-nowrap'], [])

  const rows = users.map(u => {
    return <UserRow user={u} key={u.athleteid} colClasses={colClasses}/>
  })

  return (
    <table className='table table-sm table-hover mt-2'>
      <thead>
        <tr>
          {headingCells}
        </tr>
      </thead>

      <tbody>
        {rows}
      </tbody>
    </table>
  )
}
