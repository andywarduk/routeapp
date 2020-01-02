import React, { Component } from 'react'

export default class Distance extends Component {

  render() {
    var distMt = this.props.mt
    var unit = this.props.unit
    var dp = this.props.dp

    var mult = 1

    switch (unit) {
      case 'ft':
        mult = 3.28084
        break
      case 'km':
        mult = 1 / 1000
        break
      case 'mi':
        mult = 1 / 1609.34
        break
      case 'mt':
        break
      default:
        unit = 'mt'
        break
    }

    var dist = distMt * mult

    var distString = dist.toFixed(dp)

    return (
      <>{distString} {unit}</>
    )
  }

}
