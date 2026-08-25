import { Component, ReactNode } from 'react'

import Nav from './Nav'

// Types

interface IProps {
  navContent?: ReactNode
  // React 19 removed the implicit children prop from Component<P>
  children?: ReactNode
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
