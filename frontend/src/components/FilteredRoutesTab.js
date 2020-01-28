import React, { Component } from 'react'

import FilteredRoutes from './FilteredRoutes'

export default class FilteredRoutesTab extends Component {

  switchTab = (evt, newTab) => {
    var { tabSwitched } = this.props

    evt.preventDefault()

    tabSwitched(newTab)
  }

  addTabItem = (tabItems, type, desc) => {
    var { view } = this.props

    var classes = null

    if (type === view) {
      classes = 'nav-link active'
    } else {
      classes = 'nav-link'
    }

    tabItems.push(
      <li key={type} className='nav-item'>
        <a className={classes} href='/' onClick={(evt) => this.switchTab(evt, type)}>{desc}</a>
      </li>
    )
  }

  render = () => {
    var { spinner, routes, error } = this.props

    // Build count string
    var count

    routes = routes || []

    if (error) {
      count = error.toString()
    } else {
      switch (routes.length) {
        case 0:
          count = 'No routes found'
          break
        case 1:
          count = '1 route found'
          break
        default:
          count = `${routes.length} routes found`
          break
      }
    }

    // Build tab ears
    var tabItems = []

    this.addTabItem(tabItems, FilteredRoutes.VIEW_TABLE, 'Table')
    this.addTabItem(tabItems, FilteredRoutes.VIEW_MAP, 'Map')

    var spinnerSpan = null

    if (spinner) {
      spinnerSpan = <span className='mr-2'>{spinner}</span>
    }

    tabItems.push(
      <li key={-1} className='nav-item ml-auto'>
        <a className='nav-link disabled' href='/'>
        {spinnerSpan}<span>{count}</span>
        </a>
      </li>
    )

    return (
      <ul className='nav nav-tabs mt-2'>
        {tabItems}
      </ul>
    )

  }

}
