import React, { Component, CSSProperties } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { faSort } from '@fortawesome/free-solid-svg-icons'

import UserService, { IUser } from '../UserService'
import UserRow from './UserRow'
import StravaContext from './StravaContext'

// Types

interface IProps {
}

interface IState {
  users: IUser[]
  error: string | null
  sortCol: string
  sortAsc: boolean
}

// Class definition

export default class Users extends Component<IProps, IState> {
  static contextType = StravaContext

  userService: UserService

  constructor(props: IProps) {
    super(props)

    this.state = {
      users: [],
      error: null,
      sortCol: 'lastname',
      sortAsc: true
    }

    this.userService = new UserService()
  }

  componentDidMount = async () => {
    this.loadUsers()
  }

  loadUsers = async (newState?: Partial<IState>) => {
    const { jwt } = this.context.auth

    let state: IState

    if (newState) {
      state = {
        ...this.state,
        ...newState
      }

      this.setState(state)
    } else {
      state = this.state
    }

    const { sortCol, sortAsc } = state

    const res = await this.userService.search(jwt, {
      columns: ['athleteid', 'firstname', 'lastname', 'city', 'state', 'country'],
      sort: {
        column: sortCol,
        ascending: sortAsc
      },
      perms: true
    })

    if (res.ok) {
      this.setState({
        users: res.data
      })
    } else {
      this.setState({
        error: res.data.toString()
      })
    }
  }

  sort = (col: string) => {
    const { sortCol, sortAsc } = this.state

    if (col === sortCol) {
      // Same column - reverse order
      this.loadUsers({
        sortAsc: !sortAsc
      })
    } else {
      // New column
      this.loadUsers({
        sortCol: col,
        sortAsc: true
      })
    }

  }

  render() {
    const { users, error, sortCol, sortAsc } = this.state

    if (error) {
      return (
        <div className='row'>
          <div className='col mt-2'>
            {error}
          </div>
        </div>
      )
    }

    const headingCells: JSX.Element[] = []
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

        th = <th key={key} className={thClasses.join(' ')} style={style} onClick={() => this.sort(col)} colSpan={span}>{desc}&nbsp;{icon}</th>
  
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

}
