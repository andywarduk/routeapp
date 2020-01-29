import React, { Component } from 'react'

// Types

interface IProps {
  secs: number
  minUnit?: string
}

// Class definition

export default class TimeSpan extends Component<IProps> {

  render() {
    let { secs } = this.props
    const { minUnit } = this.props

    let unit
    let nextUnit = 'h'
    let time

    do {
      unit = nextUnit
      nextUnit = ''

      switch (unit) {
      case 'h':
        {
          const hrs = Math.floor(secs / 3600)
          time = '' + hrs
          secs -= (hrs * 3600)
          nextUnit = 'm'
        }

        break
  
      case 'm':
        {
          const mins = Math.floor(secs / 60)
          time = `${time}:${('' + mins).padStart(2, '0')}`
          secs -= (mins * 60)
          nextUnit = 's'
        }

        break

      case 's':
        if (minUnit === 's') {
          time = `${time}:${('' + Math.floor(secs)).padStart(2, '0')}`
        } else {
          time = `${time}:${('' + secs).padStart(2, '0')}`
        }

        break
  
      }
    } while (nextUnit !== '' && unit !== minUnit)

    return (
      <>{time}</>
    )
  }

}
