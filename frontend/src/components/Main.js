import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import FilteredRouteTable from './FilteredRouteTable'
import AddRoutes from './AddRoutes'
import UpdateRoutes from './UpdateRoutes'
import Page from './Page'
import NavLink from './NavLink'
import StravaContext from './StravaContext'
import Permissions from '../Permissions'

class Main extends Component {
  static contextType = StravaContext

  render = () => {
    var { picMed, perms } = this.context
    var { location } = this.props

    var permissions = new Permissions(perms)

    var navItems = []
    var routes = []
    var haveLinks = false

    function addRoute(url, children) {
      routes.push(
        <Route key={url} path={url} exact>
          {children}
        </Route>
      )
    }

    function addNavUrl(url, desc, children, atEnd = true) {
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

      addRoute(url, children)

      haveLinks = true
    }

    // Links
    if (permissions.check(perms, 'addRoute')) addNavUrl('/add', 'Add', <AddRoutes/>)
    if (permissions.check(perms, 'maintainRoutes')) addNavUrl('/update', 'Maintain', <UpdateRoutes/>)

    var routeTable = <FilteredRouteTable/>

    if (haveLinks) {
      addNavUrl('/', 'Home', routeTable, false)
    } else {
      addRoute('/', routeTable)
    }

    // Avatar
    var avatar = null

    if (picMed.startsWith('http')) avatar = (
      <ul className='navbar-nav ml-auto'>
        <li key='avatar' className='nav-item'>
          <img className='rounded-circle ml-1' height="40px" width="40px" src={this.context.picMed} alt={this.context.fullName}/>
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
            <div className='row'>
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
