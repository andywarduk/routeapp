import React, { Component } from 'react'
import { Link, LinkProps } from 'react-router-dom'

// Class definition

export default class NavLink extends Component<LinkProps<{}>> {
  
  render = () => {
    return <Link className='nav-link' {...this.props}/>
  }

}
