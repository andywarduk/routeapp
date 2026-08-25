// Types

interface IProps {
  routeid: number
  desc?: string
}

// Component

export default function StravaRouteLink({ routeid, desc }: IProps) {
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
