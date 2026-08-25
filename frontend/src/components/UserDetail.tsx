import { SyntheticEvent, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import UserService, { IUser } from '../UserService'
import AuthService from '../AuthService'
import StravaContext from './StravaContext'
import { IPermissionKey, IPermissionList } from '../Permissions'

// Types

interface IUrlParams {
  userId: string
  [key: string]: string | undefined
}

// Services

const authService = new AuthService()
const userService = new UserService()

// Component

export default function UserDetail() {
  const { userId } = useParams<IUrlParams>()
  const { auth } = useContext(StravaContext)

  const [userLoading, setUserLoading] = useState(false)
  const [permKeysLoading, setPermKeysLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<IUser | null>(null)
  const [permKeys, setPermKeys] = useState<IPermissionKey[] | null>(null)
  const [changed, setChanged] = useState(false)
  const [saving, setSaving] = useState(false)

  const jwt = auth ? auth.jwt : null

  // Load the permission keys
  useEffect(() => {
    if (!jwt) return

    const loadPermKeys = async () => {
      setPermKeysLoading(true)

      const res = await authService.getPermKeys(jwt)

      if (res.ok) {
        setPermKeys(res.data)

      } else {
        setPermKeys(null)
        setError(res.data.toString())

      }

      setPermKeysLoading(false)
    }

    loadPermKeys()
  }, [jwt])

  // Load the user named in the URL
  useEffect(() => {
    if (!jwt || userId === undefined) return

    const loadUser = async () => {
      setUserLoading(true)

      const res = await userService.get(jwt, parseFloat(userId))

      if (res.ok) {
        setUser(res.data)

      } else {
        setUser(null)
        setError(res.data.toString())

      }

      setUserLoading(false)
    }

    loadUser()
  }, [jwt, userId])

  const permChanged = (evt: SyntheticEvent) => {
    const { currentTarget } = evt
    const { id } = currentTarget

    if (!user) return

    const perms: IPermissionList = {...user.perms}

    if (perms[id]) delete perms[id]
    else perms[id] = true

    setUser({
      ...user,
      perms
    })
    setChanged(true)
  }

  const save = async (evt: SyntheticEvent) => {
    evt.preventDefault()

    if (!jwt || !user) return

    const { athleteid, perms = {} } = user

    setSaving(true)

    await userService.setPerms(jwt, athleteid, perms)

    setSaving(false)
    setChanged(false)
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

  if (userLoading || permKeysLoading || !user) {
    return (
      <div className='row mt-2'>
        <div className='col'>
          <span className='me-2'>Loading...</span><FontAwesomeIcon icon={faSpinner} spin={true}/>
          </div>
      </div>
    )
  }

  const { stravaUser } = user

  // Avatars
  let avatars = null

  if (stravaUser.profile_medium.startsWith('http') || stravaUser.profile.startsWith('http')) {
    const avatarList = []

    if (stravaUser.profile_medium.startsWith('http')) {
      avatarList.push(
        <img className='mx-auto mt-2 mb-1' key='profile_medium' src={stravaUser.profile_medium} alt='Small'/>
      )
    }

    if (stravaUser.profile.startsWith('http')) {
      avatarList.push(
        <img className='mx-auto mt-1 mb-2' key='profile' src={stravaUser.profile} alt='Large'/>
      )
    }

    avatars = (
      <div className="card mt-2">
        <div className="card-header">Avatars</div>
        {avatarList}
      </div>
    )
  }

  // Permissions
  const permControls = []

  if (permKeys) {
    const perms = user.perms || {}

    for (const p of permKeys) {
      const { id, desc } = p

      permControls.push(
        <div key={id} className="form-check mx-3 my-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={perms[id] || false}
            id={id}
            disabled={saving}
            onChange={(evt) => permChanged(evt)}
          />
          <label className="form-check-label" htmlFor={id}>
            {desc}
          </label>
        </div>
      )
    }
  }

  // Convert dates
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short'
  }

  const dates = {
    created_at: new Date(Date.parse(stravaUser.created_at)).toLocaleDateString(undefined, dateOptions),
    updated_at: new Date(Date.parse(stravaUser.updated_at)).toLocaleDateString(undefined, dateOptions)
  }

  const editControl = <T extends object>(obj: T, elem: keyof T, desc: string, colWidth: number = 12) => {
    const value = '' + obj[elem]
    const id = String(elem)

    return (
      <div className="mb-3">
        <label htmlFor={id} className="col col-form-label">{desc}:</label>
        <div className={`col-${colWidth}`}>
          <input type="text" className='form-control' readOnly id={id} value={value}/>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="row">

        <div className="col-sm-6">
          <div className="card mt-2">
            <div className="card-header">User Details</div>
            {editControl(stravaUser, 'id', 'User ID')}
            {editControl(stravaUser, 'username', 'User name')}
            {editControl(stravaUser, 'firstname', 'First name')}
            {editControl(stravaUser, 'lastname', 'Last name')}
            {editControl(stravaUser, 'sex', 'Sex', 4)}
            {editControl(stravaUser, 'city', 'City')}
            {editControl(stravaUser, 'state', 'State')}
            {editControl(stravaUser, 'country', 'Country')}
            {editControl(dates, 'created_at', 'Created')}
            {editControl(dates, 'updated_at', 'Updated')}
          </div>
        </div>

        <div className="col-sm-6">
          {avatars}

          <div className="card mt-2">
            <div className="card-header">Permissions</div>
            <form>
              {permControls}
              <button
                className='btn btn-primary ms-3 mb-3'
                type='submit'
                onClick={save}
                disabled={saving || !changed}
              >
                Save
              </button>
            </form>
          </div>
        </div>

      </div>
    </>
  )
}
