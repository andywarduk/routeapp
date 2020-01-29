import React, { Component } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import { IUser } from '../UserService'

// Types

interface IProps {
  user: IUser
  colClasses: string[][]
}

// Class definition

class UserRow extends Component<RouteComponentProps & IProps> {

  commaSep = (...args: string[]) => {
    return args.reduce((result, str) => {
      if (str && str !== '') {
        if (result === '') result = str
        else result = `${result}, ${str}`
      }
      return result
    }, '')
  } 

  permBadge = (colour: string, text: string) => {
    const classes = [
      'badge',
      `badge-${colour}`,
      'btn-sm',
      'text-nowrap'
    ]

    return (
      <span
        key={text}
        className={classes.join(' ')}
      >
        <span className='mx-1'>{text}</span>
      </span>
    )
  }

  click = () => {
    const { history, location, user } = this.props

    history.push(`${location.pathname}/${user.athleteid}`)
  }

  render = () => {
    const { user, colClasses } = this.props
    const { stravaUser, perms: userPerms } = user

    const perms = []

    if (userPerms) {
      if (userPerms.admin) {
        perms.push(this.permBadge('danger', 'Admin'))
        
      } else {
        for (const k of Object.keys(userPerms)) {
          if (k !== 'viewRoutes' && k !== 'admin') {
            perms.push(this.permBadge('warning', 'Modify'))  
            break
          }
        }

        if (perms.length === 0) {
          perms.push(this.permBadge('secondary', 'User'))  
        }
      }
    }

    return (
      <tr onClick={this.click} style={{cursor: 'pointer'}}>
        <td className={colClasses[0].join(' ')}>{stravaUser.id}</td>
        <td className={colClasses[1].join(' ')}>{stravaUser.firstname}</td>
        <td className={colClasses[2].join(' ')}>{stravaUser.lastname}</td>
        <td className={colClasses[3].join(' ')}>{this.commaSep(stravaUser.city, stravaUser.state, stravaUser.country)}</td>
        <td className={colClasses[4].join(' ')}>{perms}</td>
      </tr>
    )
  }

}

export default withRouter(UserRow)
