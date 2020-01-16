import React, { Component } from 'react'

import Nav from './Nav'

export default class PlainPage extends Component {

  render = () => {
    var { children, navContent } = this.props

    return (
      <>
        <Nav>
          {navContent}
        </Nav>

        <div className='container-fluid'>
          {children}
        </div>
      </>
    )
  }
}
