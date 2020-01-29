import React, { Component, ReactNode } from 'react'

import Nav from './Nav'

// Types

interface IProps {
  navContent?: ReactNode
}

// Class definition

export default class Page extends Component<IProps> {

  render = () => {
    const { children, navContent } = this.props

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
