import { Component, ComponentType, ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'

import FilteredRoutes from './FilteredRoutes'
import AddRoutes from './AddRoutes'
import UpdateRoutes from './UpdateRoutes'
import UserRoutes from './UserRoutes'
import Page from './Page'
import NavLink from './NavLink'
import StravaContext from './StravaContext'
import Permissions from '../Permissions'
import { withRouter, RouterProps } from './withRouter'

// Class definition

class Main extends Component<RouterProps> {
  static contextType: typeof StravaContext = StravaContext
  declare context: React.ContextType<typeof StravaContext>

  render = () => {
    const { location } = this.props
    const { auth } = this.context

    if (auth) {
      const { picMed, fullName, perms} = auth

      const navItems: ReactNode[] = []
      const routes: ReactNode[] = []
      let haveLinks = false

      // react-router 6+ matches the full path by default; a route that needs to
      // match its descendants opts in with a trailing /*
      const addRoute = (url: string, exact: boolean, RouteComponent: ComponentType) => {
        const path = exact ? url : `${url.replace(/\/+$/, '')}/*`

        routes.push(
          <Route key={url} path={path} element={<RouteComponent/>}/>
        )
      }

      const addNavUrl = (url: string, exact: boolean, desc: string, RouteComponent: ComponentType, atEnd: boolean = true) => {
        const method = (atEnd ? 'push' : 'unshift')
        const classes = ['nav-item']

        if (url === location.pathname) {
          classes.push('active')
          classes.push('disabled')
        }

        navItems[method](
          <li key={url} className={classes.join(" ")}>
            <NavLink to={url}>{desc}</NavLink>
          </li>
        )

        addRoute(url, exact, RouteComponent)

        haveLinks = true
      }

      const permissions = new Permissions(perms)

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
      let avatar = null

      if (picMed.startsWith('http')) avatar = (
        <ul className='navbar-nav ms-auto'>
          <li key='avatar' className='nav-item'>
            <img className='rounded-circle ms-1' height="40px" width="40px" src={picMed} alt={fullName}/>
          </li>
        </ul>
      )

      let navContent

      if (navItems.length > 0) {
        navContent = (
          <>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"/>
            </button>

            <div className='collapse navbar-collapse' id='navbarNav'>
              <ul className='navbar-nav ms-auto'>
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
          <Routes>
            {routes}
            <Route path='*' element={
              <div className='row mt-2'>
                <div className='col'>
                  Error - Page not found
                </div>
              </div>
            }/>
          </Routes>
        </Page>
      )
    }

    return <></>
  }

}

export default withRouter(Main)
