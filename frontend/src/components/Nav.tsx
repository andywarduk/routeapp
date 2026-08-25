import { Component, ReactNode } from 'react'

// Types

// React 19 removed the implicit children prop from Component<P>
interface IProps {
  children?: ReactNode
}

// Class definition

export default class Nav extends Component<IProps> {

  render = () => {
    const { children } = this.props

    let devMsg

    if (import.meta.env.DEV) {
      devMsg = ` (${import.meta.env.MODE})`
    }

    /*
     * Bootstrap 5 navbars lay out through a container child and set their own
     * horizontal padding to zero, and navbar-dark is replaced by
     * data-bs-theme="dark". The brand is the anchor itself, which is what
     * suppresses the default link underline.
     */
    return (
      <nav className="navbar bg-primary navbar-expand-md" data-bs-theme="dark">
        <div className="container-fluid">
          <a className='navbar-brand d-flex align-items-center mb-0 mt-0 h1' href='/'>
            <img src='/logow32.png' alt=''/>
            <span className='ms-2'>CCC Route Finder{devMsg}</span>
          </a>

          {children}
        </div>
      </nav>
    )
  }

}
