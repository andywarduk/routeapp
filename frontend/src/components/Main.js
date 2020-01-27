import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import FilteredRoutes from './FilteredRoutes'
import AddRoutes from './AddRoutes'
import UpdateRoutes from './UpdateRoutes'
import UserRoutes from './UserRoutes'
import Page from './Page'
import NavLink from './NavLink'
import StravaContext from './StravaContext'
import Permissions from '../Permissions'

class Main extends Component {
  static contextType = StravaContext

  render = () => {
    var { picMed, fullName, perms } = this.context.auth
    var { location } = this.props

    var navItems = []
    var routes = []
    var haveLinks = false

    function addRoute(url, exact, Component) {
      routes.push(
        <Route key={url} path={url} component={Component} exact={exact}/>
      )
    }

    function addNavUrl(url, exact, desc, Component, atEnd = true) {
      var method = (atEnd ? 'push' : 'unshift')
      var classes = ['nav-item']

      if (url === location.pathname) {
        classes.push('active')
        classes.push('disabled')
      }

      navItems[method](
        <li key={url} className={classes.join(" ")}>
          <NavLink to={url}>{desc}</NavLink>
        </li>
      )

      addRoute(url, exact, Component)

      haveLinks = true
    }

    var permissions = new Permissions(perms)

    // Links
    if (permissions.check('modifyRoutes')) {
      addNavUrl('/add', true, 'Add', AddRoutes)
      addNavUrl('/update', true, 'Maintain', UpdateRoutes)
    }

    if (permissions.check('admin')) {
      addNavUrl('/users', false, 'Users', UserRoutes)
    }

    if (haveLinks) {
      addNavUrl('/', true, 'Home', FilteredRoutes, false)
    } else {
      addRoute('/', true, FilteredRoutes)
    }

    // Avatar
    var avatar = null

    if (picMed.startsWith('http')) avatar = (
      <ul className='navbar-nav ml-auto'>
        <li key='avatar' className='nav-item'>
          <img className='rounded-circle ml-1' height="40px" width="40px" src={picMed} alt={fullName}/>
        </li>
      </ul>
    )
    
    var navContent

    if (navItems.length > 0) {
      navContent = (
        <>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"/>
          </button>

          <div className='collapse navbar-collapse' id='navbarNav'>
            <ul className='navbar-nav ml-auto'>
              {navItems}
            </ul>
          </div>

          {avatar}
        </>
      )

    } else {
      navContent = (
        <>
          {avatar}
        </>
      )

    }

    return (
      <Page navContent={navContent}>
        <Switch>
          {routes}
          <Route path='*'>
            <div className='row mt-2'>
              <div className='col'>
                Error - Page not found
              </div>
            </div>
          </Route>
        </Switch>
      </Page>
    )
  }

}

export default withRouter(Main)
