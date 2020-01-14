import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import { Container, Navbar, NavbarBrand } from 'reactstrap'

import FilteredRouteTable from './FilteredRouteTable'
import StravaGateway from './StravaGateway'
import UpdateTable from './UpdateTable'

function App() {
  var devMsg

  if (process.env.NODE_ENV !== 'production') {
    devMsg = ` (${process.env.NODE_ENV})`
  }

  return (
    <Router>

      <Navbar dark={true} color='primary'>
        <NavbarBrand>
          <img src='/logow32.png' alt='' className='mr-1'/>
          <span className='ml-1'>CCC Route Finder{devMsg}</span>
        </NavbarBrand>
      </Navbar>

      <Container fluid>
        <Switch>
          <Route path='/' exact>
            <FilteredRouteTable/>
          </Route>
          <Route path='/update'>
            <StravaGateway>
              <UpdateTable/>
            </StravaGateway>
          </Route>
        </Switch>
      </Container>

    </Router>
  )
}

export default App
