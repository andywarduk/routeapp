import React, { Component } from 'react'
import convertLength from '../LengthConv'

export default class Distance extends Component {

  render() {
    var metres = this.props.m || 0
    var unit = this.props.unit || 'm'
    var dp = this.props.dp || 0

    var dist = convertLength(metres, 'm', unit)

    var distString = dist.toFixed(dp)

    return (
      <>{distString} {unit}</>
    )
  }

}
