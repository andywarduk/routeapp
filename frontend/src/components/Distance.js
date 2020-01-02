import React, { Component } from 'react'
import convertLength from '../LengthConv'

export default class Distance extends Component {

  render() {
    var distMt = this.props.mt || 0
    var unit = this.props.unit || 'mt'
    var dp = this.props.dp || 0

    var dist = convertLength(distMt, 'mt', unit)

    var distString = dist.toFixed(dp)

    return (
      <>{distString} {unit}</>
    )
  }

}
