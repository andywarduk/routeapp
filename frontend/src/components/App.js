import React from 'react'
import FilteredRouteTable from './FilteredRouteTable'
import { Container, Navbar, NavbarBrand } from 'reactstrap'

function App() {
  var devMsg

  if (process.env.NODE_ENV !== 'production') {
    devMsg = ` (${process.env.NODE_ENV})`
  }

  return (
    <>
      <Navbar dark={true} color='primary'>
        <NavbarBrand>CCC Route Finder{devMsg}</NavbarBrand>
      </Navbar>
      <Container fluid>
        <FilteredRouteTable/>
      </Container>
    </>
  )
}

export default App
