import React from 'react'
import FilteredRouteTable from './FilteredRouteTable'
import { Container, Navbar, NavbarBrand, NavItem } from 'reactstrap'

function App() {
  var devMsg

  if (process.env.NODE_ENV !== 'production') {
    devMsg = ` (${process.env.NODE_ENV})`
  }

  return (
    <>
      <Navbar dark={true} color='primary'>
        <NavbarBrand><img src='/logow32.png'/>&nbsp;&nbsp;CCC Route Finder{devMsg}</NavbarBrand>
      </Navbar>
      <Container fluid>
        <FilteredRouteTable/>
      </Container>
    </>
  )
}

export default App
