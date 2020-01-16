import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { faSort } from '@fortawesome/free-solid-svg-icons'

import RouteRow from './RouteRow'

export default class RouteTable extends Component {

  sort = (col) => {
    var { sortCb } = this.props

    sortCb(col)
  }

  renderHeadingCell = (col, desc, span) => {
    var { sortCol, sortAsc } = this.props

    var th

    if (col) {
      var icon

      if (col === sortCol) {
        if (sortAsc) {
          icon = <FontAwesomeIcon icon={faSortDown} />
        } else {
          icon = <FontAwesomeIcon icon={faSortUp} />
        }
      } else {
        icon = <FontAwesomeIcon icon={faSort} />
      }

      th = <th className='text-nowrap' onClick={() => this.sort(col)} colSpan={span}>{desc}&nbsp;{icon}</th>

    } else {
      th = <th className='text-nowrap' colSpan={span}>{desc}</th>

    }

    return th
  }

  render() {
    var { routes } = this.props

    var rows = routes.map(r => {
      return <RouteRow route={r} key={r.routeid} />
    })

    return (
      <table className='table table-sm mt-2'>
        <thead>
          <tr>
            {this.renderHeadingCell('routeid', 'Link', 1)}
            {this.renderHeadingCell('name', 'Name', 1)}
            {this.renderHeadingCell(null, 'Description', 1)}
            {this.renderHeadingCell('distance', 'Distance', 2)}
            {this.renderHeadingCell('elevation_gain', 'Elevation', 2)}
            {this.renderHeadingCell('estimated_moving_time', 'Time', 1)}
          </tr>
        </thead>

        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

}
