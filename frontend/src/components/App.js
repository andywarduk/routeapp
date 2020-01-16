import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

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

      <nav className="navbar navbar-dark bg-primary navbar-expand-md">
        <a href='/'>
          <img src='/logow32.png' alt='' className='mr-1'/>
          <span style={{verticalAlign: 'middle'}} className='navbar-brand ml-1 mb-0 mt-0 h1'>CCC Route Finder{devMsg}</span>
        </a>

        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="ml-auto navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="/">Home <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/def">Features</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/ghi">Pricing</a>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" href="/jkl" tabIndex="-1" aria-disabled="true">Disabled</a>
            </li>
          </ul>
        </div>
  
      </nav>

      <div className='container-fluid'>
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
      </div>

    </Router>
  )
}

export default App
