function getMetreMult(unit: string)
{
  let mult: number

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
    case 'm':
      mult = 1
      break
    default:
      throw new Error(`Invalid unit: ${unit}`)
  }

  return mult
}

function convertLength(lengthIn: number, unitFrom: string, unitTo: string)
{
  let mult: number

  // Convert to metres
  mult = getMetreMult(unitFrom)
  const metres = lengthIn / mult

  // Convert to target unit
  mult = getMetreMult(unitTo)
  const lengthOut = metres * mult

  return lengthOut
}

export default convertLength
