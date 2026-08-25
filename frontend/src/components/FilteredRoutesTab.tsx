import { Component, SyntheticEvent, ReactElement } from 'react'

import { FilteredRoutesView } from './FilteredRoutes'
import { IRoute } from '../RouteService'

// Types

interface IProps {
  tabSwitched: (newTab: FilteredRoutesView) => void
  view: FilteredRoutesView
  spinner: ReactElement | null
  routes: IRoute[]
  error: string | null
}

// Class definition

export default class FilteredRoutesTab extends Component<IProps> {

  switchTab = (evt: SyntheticEvent, newTab: FilteredRoutesView) => {
    const { tabSwitched } = this.props

    evt.preventDefault()

    tabSwitched(newTab)
  }

  addTabItem = (tabItems: ReactElement[], type: FilteredRoutesView, desc: string) => {
    const { view } = this.props

    const classes = (type === view ? 'nav-link active' : 'nav-link')

    tabItems.push(
      <li key={type} className='nav-item'>
        <a className={classes} href='/' onClick={(evt) => this.switchTab(evt, type)} tabIndex={0}>{desc}</a>
      </li>
    )
  }

  render = () => {
    const { spinner, routes = [], error } = this.props

    // Build count string
    let count

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
    const tabItems: ReactElement[] = []

    this.addTabItem(tabItems, FilteredRoutesView.VIEW_TABLE, 'Table')
    this.addTabItem(tabItems, FilteredRoutesView.VIEW_MAP, 'Map')

    let spinnerSpan = null

    if (spinner) {
      spinnerSpan = <span className='me-2'>{spinner}</span>
    }

    tabItems.push(
      <li key={-1} className='nav-item ms-auto'>
        <span className='nav-link disabled'>
          {spinnerSpan}
          <span>{count}</span>
        </span>
      </li>
    )

    return (
      <ul className='nav nav-tabs mt-2'>
        {tabItems}
      </ul>
    )

  }

}
