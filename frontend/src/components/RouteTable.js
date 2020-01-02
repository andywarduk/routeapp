import React, { Component } from 'react'
import RouteRow from './RouteRow'
import { Table } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { faSort } from '@fortawesome/free-solid-svg-icons'

export default class RouteTable extends Component {

  sort = (col) => {
    this.props.sortCb(col)
  }

  renderHeadingCell = (col, desc, span) => {
    var th

    if (col) {
      var icon

      if (col === this.props.sortCol) {
        if (this.props.sortAsc) {
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
    var rows = this.props.routes.map(r => {
      return <RouteRow route={r} key={r.routeid} />
    })

    return (
      <Table size='sm'>
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
      </Table>
    )
  }

}
