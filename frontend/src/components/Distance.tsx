import convertLength from '../LengthConv'

// Types

interface IProps {
  m?: number
  unit?: string
  dp?: number
  showUnit?: boolean
}

// Component

export default function Distance({ m: metres = 0, unit = 'm', dp = 0, showUnit }: IProps) {
  const dist = convertLength(metres, 'm', unit)

  let distString
  if (dp < 0) {
    const factor = Math.pow(10, -dp)
    distString = (Math.round(dist / factor) * factor).toFixed(0)
  } else {
    distString = dist.toFixed(dp)
  }

  if (showUnit || showUnit === undefined) {
    return (
      <>{distString} {unit}</>
    )
  }

  return <>{distString}</>
}
