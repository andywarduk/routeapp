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
        <NavbarBrand>
          <img src='/logow32.png' alt='' className='mr-1'/>
          <span className='ml-1'>CCC Route Finder{devMsg}</span>
        </NavbarBrand>
      </Navbar>
      <Container fluid>
        <FilteredRouteTable/>
      </Container>
    </>
  )
}

export default App
