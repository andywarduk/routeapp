import React from 'react'
import FilteredRouteTable from './FilteredRouteTable'
import { Container, Navbar, NavbarBrand } from 'reactstrap'

function App() {
  return (
    <>
      <Navbar dark={true} color='primary'><NavbarBrand>CCC Route Finder</NavbarBrand></Navbar>
      <Container fluid>
        <FilteredRouteTable/>
      </Container>
    </>
  )
}

export default App
