import React, { Component } from 'react'
import Distance from './Distance'
import TimeSpan from './TimeSpan'
import StravaRouteLink from './StravaRouteLink'

export default class RouteRow extends Component {

  render() {
    var { route, colClasses } = this.props

    return (
      <tr>
        <td className={colClasses[0].join(' ')}>
          <StravaRouteLink routeid={route.routeid}/>
        </td>
        <td className={colClasses[1].join(' ')}>{route.name}</td>
        <td className={colClasses[2].join(' ')}>{route.description}</td>

        <td className={colClasses[3].join(' ')}>
          <Distance m={route.distance} unit='mi' dp='0' showUnit={false}/>/<Distance m={route.distance} unit='km' dp='0' showUnit={false}/>
        </td>
        <td className={colClasses[4].join(' ')}>
          <Distance m={route.distance} unit='mi' dp='1'/>
        </td>
        <td className={colClasses[5].join(' ')}>
          <Distance m={route.distance} unit='km' dp='1'/>
        </td>

        <td className={colClasses[6].join(' ')}>
          <Distance m={route.elevation_gain} unit='m' dp='0'/>
        </td>
        <td className={colClasses[7].join(' ')}>
          <Distance m={route.elevation_gain} unit='ft' dp='0'/>
        </td>

        <td className={colClasses[8].join(' ')}>
          <TimeSpan secs={route.estimated_moving_time} minUnit='m' />
        </td>
      </tr>
    )
  }

}
