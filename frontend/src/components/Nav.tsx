import { Component } from 'react'

// Class definition

export default class Nav extends Component<{}> {

  render = () => {
    const { children } = this.props

    let devMsg

    if (process.env.NODE_ENV !== 'production') {
      devMsg = ` (${process.env.NODE_ENV})`
    }

    return (
      <nav className="navbar navbar-dark bg-primary navbar-expand-md">
        <a href='/'>
          <img src='/logow32.png' alt='' className='mr-1'/>
          <span style={{verticalAlign: 'middle'}} className='navbar-brand ml-1 mb-0 mt-0 h1'>CCC Route Finder{devMsg}</span>
        </a>

        {children}
      </nav>
    )
  }

}
