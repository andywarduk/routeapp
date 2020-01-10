import React, { Component } from 'react'
import Distance from './Distance'
import TimeSpan from './TimeSpan'

export default class RouteRow extends Component {

  render() {
    return (
      <tr>
        <td>
          <a
            href={`http://www.strava.com/routes/${this.props.route.routeid}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {this.props.route.routeid}
          </a>
        </td>
        <td>{this.props.route.name}</td>
        <td>{this.props.route.description}</td>
        <td className='text-right text-nowrap'>
          <Distance m={this.props.route.distance} unit='mi' dp='1'/>
        </td>
        <td className='text-right text-nowrap'>
          <Distance m={this.props.route.distance} unit='km' dp='1'/>
        </td>
        <td className='text-right text-nowrap'>
          <Distance m={this.props.route.elevation_gain} unit='m' dp='0'/>
        </td>
        <td className='text-right text-nowrap'>
          <Distance m={this.props.route.elevation_gain} unit='ft' dp='0'/>
        </td>
        <td className='text-right text-nowrap'>
          <TimeSpan secs={this.props.route.estimated_moving_time} minUnit='m' />
        </td>
      </tr>
    )
  }

}
