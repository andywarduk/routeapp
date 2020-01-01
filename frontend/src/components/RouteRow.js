import React, { Component } from 'react'

export default class RouteRow extends Component {

  constructor(props) {
      super(props)
  }

  render() {
    return (
      <tr>
        <td>{this.props.route.routeid}</td>
        <td>{this.props.route.name}</td>
        <td>{this.props.route.description}</td>
        <td>{this.props.route.distance}</td>
        <td>{this.props.route.elevation_gain}</td>
        <td>{this.props.route.estimated_moving_time}</td>
      </tr>
    )
  }

}
