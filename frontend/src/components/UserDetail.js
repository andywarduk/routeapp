import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import UserService from '../UserService'
import AuthService from '../AuthService'
import StravaContext from './StravaContext'

class UserDetail extends Component {
  static contextType = StravaContext

  constructor(props) {
    super(props)

    this.state = {
      userLoading: false,
      permKeysLoading: false,
      error: null,
      user: null,
      permKeys: null,
      changed: false,
      saving: false
    }

    this.authService = new AuthService()
    this.userService = new UserService()
  }

  componentDidMount = () => {
    var { userId } = this.props.match.params

    this.loadPermKeys()
    this.loadUser(userId)
  }

  render = () => {
    var { userLoading, permKeysLoading, error, user, permKeys, changed, saving } = this.state

    if (error){
      return (
        <div className='row mt-2'>
          <div className='col'>
            {this.error}
          </div>
        </div>
      )
    }

    if (userLoading || permKeysLoading || !user) {
      return (
        <div className='row mt-2'>
          <div className='col'>
            <span className='mr-2'>Loading...</span><FontAwesomeIcon icon={faSpinner} spin={true}/>
            </div>
        </div>
      )
    }

    var { stravaUser } = user

    // Avatars
    var avatars = null

    if (user.stravaUser.profile_medium.startsWith('http') || user.stravaUser.profile.startsWith('http')) {
      var avatarList = []

      if (user.stravaUser.profile_medium.startsWith('http')) {
        avatarList.push(
          <img className='mx-auto mt-2 mb-1' key='profile_medium' src={user.stravaUser.profile_medium} alt='Small'/>
        )
      }
      
      if (user.stravaUser.profile.startsWith('http')) {
        avatarList.push(
          <img className='mx-auto mt-1 mb-2' key='profile' src={user.stravaUser.profile} alt='Large'/>
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
    var permControls = []

    for (var p of permKeys) {
      var { id, desc } = p

      permControls.push(
        <div key={id} className="form-check mx-3 my-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={user.perms[id] || false}
            id={id}
            disabled={saving}
            onChange={(evt) => this.permChanged(evt)}
          />
          <label className="form-check-label" htmlFor={id}>
            {desc}
          </label>
        </div>
      )
    }

    // Convert dates
    const dateOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    }

    var dates = {
      created_at: new Date(Date.parse(stravaUser.created_at)).toLocaleDateString(undefined, dateOptions),
      updated_at: new Date(Date.parse(stravaUser.updated_at)).toLocaleDateString(undefined, dateOptions)
    }

    var editControl = (obj, elem, desc, colWidth = 12) => {
      var value = obj[elem] || ''

      return (
        <div className="form-group">
          <label htmlFor={elem} className="col col-form-label">{desc}:</label>
          <div className={`col-${colWidth}`}>
            <input type="text" className='form-control' readOnly id={elem} value={value}/>
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
                  className='btn btn-primary ml-3 mb-3'
                  type='submit'
                  onClick={this.save}
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

  loadUser = async (id) => {
    var { jwt } = this.context

    this.setState({
      userLoading: true
    })

    var res = await this.userService.get(jwt, id)

    if (res.ok) {
      this.setState({
        userLoading: false,
        user: res.data
      })

    } else {
      this.setState({
        userLoading: false,
        user: null,
        error: res.data.toString()
      })

    }
  }

  loadPermKeys = async () => {
    var { jwt } = this.context

    this.setState({
      permKeysLoading: true
    })

    var res = await this.authService.getPermKeys(jwt)

    if (res.ok) {
      this.setState({
        permKeysLoading: false,
        permKeys: res.data
      })

    } else {
      this.setState({
        permKeysLoading: false,
        permKeys: null,
        error: res.data.toString()
      })

    }
  }

  permChanged = (evt) => {
    var { target } = evt
    var { id } = target
    var { user } = this.state
    var perms = {...user.perms}

    if (perms[id]) delete perms[id]
    else perms[id] = true

    this.setState({
      user: {
        ...user,
        perms
      },
      changed: true
    })
  }

  save = async (evt) => {
    evt.preventDefault()

    var { user } = this.state
    var { perms } = user
    var { jwt } = this.context

    this.setState({
      saving: true
    })

    await this.userService.setPerms(jwt, user.athleteid, perms)

    this.setState({
      saving: false,
      changed: false
    })
    
  }

}

export default withRouter(UserDetail)