import React, { Component } from 'react'
import Distance from './Distance'
import TimeSpan from './TimeSpan'

export default class RouteRow extends Component {

  render() {
    var { route } = this.props

    return (
      <tr>
        <td>
          <a
            href={`http://www.strava.com/routes/${route.routeid}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {route.routeid}
          </a>
        </td>
        <td>{route.name}</td>
        <td>{route.description}</td>
        <td className='text-right text-nowrap'>
          <Distance m={route.distance} unit='mi' dp='1'/>
        </td>
        <td className='text-right text-nowrap'>
          <Distance m={route.distance} unit='km' dp='1'/>
        </td>
        <td className='text-right text-nowrap'>
          <Distance m={route.elevation_gain} unit='m' dp='0'/>
        </td>
        <td className='text-right text-nowrap'>
          <Distance m={route.elevation_gain} unit='ft' dp='0'/>
        </td>
        <td className='text-right text-nowrap'>
          <TimeSpan secs={route.estimated_moving_time} minUnit='m' />
        </td>
      </tr>
    )
  }

}
