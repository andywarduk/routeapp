import { Component } from 'react'

import convertLength from '../LengthConv'

// Types

interface IProps {
  m?: number
  unit?: string
  dp?: number
  showUnit?: boolean
}

// Class definition

export default class Distance extends Component<IProps> {

  render() {
    let { m: metres, unit, dp } = this.props

    metres = metres || 0
    unit = unit || 'm'
    dp = dp || 0

    const dist = convertLength(metres, 'm', unit)

    let distString
    if (dp < 0) {
      const factor = Math.pow(10, -dp)
      distString = (Math.round(dist / factor) * factor).toFixed(0)
    } else {
      distString = dist.toFixed(dp)
    }

    if (this.props.showUnit || this.props.showUnit === undefined) {
      return (
        <>{distString} {unit}</>
      )
    }

    return <>{distString}</>
  }

}
