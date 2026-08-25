import { useLocation, useNavigate } from 'react-router-dom'

import { IUser } from '../UserService'

// Types

interface IProps {
  user: IUser
  colClasses: string[][]
}

// Helpers

const commaSep = (...args: string[]) => {
  return args.reduce((result, str) => {
    if (str && str !== '') {
      if (result === '') result = str
      else result = `${result}, ${str}`
    }
    return result
  }, '')
}

const permBadge = (colour: string, text: string) => {
  const classes = [
    'badge',
    `bg-${colour}`,
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

// Component

export default function UserRow({ user, colClasses }: IProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const { stravaUser, perms: userPerms } = user

  const click = () => {
    navigate(`${location.pathname.replace(/\/+$/, '')}/${user.athleteid}`)
  }

  const perms = []

  if (userPerms) {
    if (userPerms.admin) {
      perms.push(permBadge('danger', 'Admin'))

    } else {
      for (const k of Object.keys(userPerms)) {
        if (k !== 'viewRoutes' && k !== 'admin') {
          perms.push(permBadge('warning', 'Modify'))
          break
        }
      }

      if (perms.length === 0) {
        perms.push(permBadge('secondary', 'User'))
      }
    }
  }

  return (
    <tr onClick={click} style={{cursor: 'pointer'}}>
      <td className={colClasses[0].join(' ')}>{stravaUser.id}</td>
      <td className={colClasses[1].join(' ')}>{stravaUser.firstname}</td>
      <td className={colClasses[2].join(' ')}>{stravaUser.lastname}</td>
      <td className={colClasses[3].join(' ')}>{commaSep(stravaUser.city, stravaUser.state, stravaUser.country)}</td>
      <td className={colClasses[4].join(' ')}>{perms}</td>
    </tr>
  )
}
