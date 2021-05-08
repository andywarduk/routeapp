import { Component } from 'react'

// Types

interface IProps {
  routeid: number
  desc?: string
}

// Class definition

export default class StravaRouteLink extends Component<IProps> {

  render() {
    const { routeid } = this.props
    let { desc } = this.props

    if (!desc || desc === '') desc = '' + routeid

    return (
      <a
        href={`http://www.strava.com/routes/${routeid}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        {desc}
      </a>
    )
  }

}