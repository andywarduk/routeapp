import React, { Component } from 'react'

export default class TimeSpan extends Component {

  render() {
    var secs = this.props.secs
    var minUnit = this.props.minUnit

    var time

    do {
      var hrs = Math.floor(secs / 3600)
      time = '' + hrs
      if (minUnit === 'h') break

      secs -= (hrs * 3600)
      var mins = Math.floor(secs / 60)
      time = `${time}:${('' + mins).padStart(2, '0')}`
      if (minUnit === 'm') break

      secs -= (mins * 60)
      if (minUnit === 's') {
        time = `${time}:${('' + Math.floor(secs)).padStart(2, '0')}`
      } else {
        time = `${time}:${('' + secs).padStart(2, '0')}`
      }
    } while (0)

    return (
      <>{time}</>
    )
  }

}
