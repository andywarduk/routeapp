import React, { Component } from 'react'
import convertLength from '../LengthConv'

export default class Distance extends Component {

  render() {
    var { m, unit, dp } = this.props

    var metres = m || 0
    unit = unit || 'm'
    dp = dp || 0

    var dist = convertLength(metres, 'm', unit)

    var distString = dist.toFixed(dp)

    if (this.props.showUnit || this.props.showUnit === undefined) {
      return (
        <>{distString} {unit}</>
      )
    }

    return <>{distString}</>
  }

}
