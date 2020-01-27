import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { faSort } from '@fortawesome/free-solid-svg-icons'

import UserService from '../UserService'
import UserRow from './UserRow'
import StravaContext from './StravaContext'

export default class Users extends Component {
  static contextType = StravaContext

  constructor(props) {
    super(props)

    this.state = {
      users: [],
      error: null,
      sortCol: 'athleteid',
      sortAsc: true
    }

    this.userService = new UserService()
  }

  componentDidMount = async (props) => {
    this.loadUsers()
  }

  loadUsers = async (newState) => {
    var { jwt } = this.context.auth

    var state = this.state

    if (newState) {
      this.setState(newState)

      state = {
        ...this.state,
        ...newState
      }
    }

    var { sortCol, sortAsc } = state

    var res = await this.userService.search(jwt, {
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

  sort = (col) => {
    var { sortCol, sortAsc } = this.state

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
    var { users, error, sortCol, sortAsc } = this.state

    if (error) {
      return (
        <div className='row'>
          <div className='col mt-2'>
            {error}
          </div>
        </div>
      )
    }

    var headingCells = []
    var colClasses = []

    var addHeadingCell = (col, desc, span, commonClasses, thClasses, tdClasses) => {
      // Build full class lists
      thClasses = commonClasses.concat(thClasses)
      tdClasses = commonClasses.concat(tdClasses)

      // Save classes for row use
      for (var i = 0; i < span; i++) colClasses.push(tdClasses)

      var th
      var key = headingCells.length

      var style = {}

      if (col) {
        var icon
  
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
    addHeadingCell('athleteid', 'Athlete', 1, ['text-nowrap'], [], [])
    addHeadingCell('firstname', 'First Name', 1, ['text-nowrap'], [], [])
    addHeadingCell('lastname', 'Last Name', 1, ['text-nowrap'], [], [])
    addHeadingCell(null, 'Location', 1, ['d-none', 'd-md-table-cell'], ['text-nowrap'], [])
    addHeadingCell(null, 'Permissions', 1, ['d-none', 'd-md-table-cell'], ['text-nowrap'], [])

    var rows = users.map(u => {
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
