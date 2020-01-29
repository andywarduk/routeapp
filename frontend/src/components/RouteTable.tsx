import React, { Component, CSSProperties } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp } from '@fortawesome/free-solid-svg-icons'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { faSort } from '@fortawesome/free-solid-svg-icons'

import RouteRow from './RouteRow'
import { IRoute } from '../RouteService'

// Types

interface IProps {
  routes: IRoute[]
  sortCol: string
  sortAsc: boolean
  sortCb: (col: string) => void
}

// Class definition

export default class RouteTable extends Component<IProps> {

  sort = (col: string) => {
    const { sortCb } = this.props

    sortCb(col)
  }

  render() {
    const { routes, sortCol, sortAsc } = this.props

    const headingCells: JSX.Element[] = []
    const colClasses: string[][] = []

    const addHeadingCell = (col: string | null, desc: string, span: number,
      commonClasses: string[], thClasses: string[], tdClasses: string[]) => {
      // Build full class lists
      thClasses = commonClasses.concat(thClasses)
      tdClasses = commonClasses.concat(tdClasses)

      // Save classes for row use
      for (let i = 0; i < span; i++) colClasses.push(tdClasses)

      let th
      const key = headingCells.length

      const style: CSSProperties = {
        borderTop: 'none'
      }

      if (col) {
        let icon
  
        if (col === sortCol) {
          if (sortAsc) {
            icon = <FontAwesomeIcon icon={faSortDown} />
          } else {
            icon = <FontAwesomeIcon icon={faSortUp} />
          }
        } else {
          icon = <FontAwesomeIcon icon={faSort} />
        }
  
        style.cursor = 'pointer'

        th = <th key={key} className={thClasses.join(' ')} style={style} onClick={() => this.sort(col)} colSpan={span}>{desc}&nbsp;{icon}</th>
  
      } else {
        th = <th key={key} className={thClasses.join(' ')} style={style} colSpan={span}>{desc}</th>
  
      }

      headingCells.push(th)
    }

    // Set up heading cells
    addHeadingCell('routeid', 'Link', 1, ['text-nowrap'], [], [])
    addHeadingCell('name', 'Name', 1, [], ['text-nowrap'], [])
    addHeadingCell(null, 'Description', 1, ['d-none', 'd-lg-table-cell'], ['text-nowrap'], [])
    addHeadingCell('distance', 'mi/km', 1, ['text-nowrap', 'd-xl-none', 'd-lg-none', 'd-sm-none', 'text-right'], [], [])
    addHeadingCell('distance', 'Distance', 2, ['text-nowrap', 'd-none', 'd-sm-table-cell'], ['text-center'], ['text-right'])
    addHeadingCell('elevation_gain', 'Elevation', 2, ['text-nowrap', 'd-none', 'd-sm-table-cell'], ['text-center'], ['text-right'])
    addHeadingCell('estimated_moving_time', 'Time', 1, ['text-nowrap', 'd-none', 'd-sm-table-cell', 'text-right'], [], [])

    const rows = routes.map((r) => {
      return <RouteRow route={r} key={r.routeid} colClasses={colClasses}/>
    })

    return (
      <table className='table table-sm'>
        <thead>
          <tr>
            {headingCells}
          </tr>
        </thead>

        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

}
