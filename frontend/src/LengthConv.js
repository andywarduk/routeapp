function getMtMult(unit)
{
  var mult

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
      mult = 1
      break
    default:
      throw new Error(`Invalid unit: ${unit}`)
  }

  return mult
}

function convertLength(lengthIn, unitFrom, unitTo)
{
  var mult

  // Convert to metres
  mult = getMtMult(unitFrom)
  var metres = lengthIn / mult

  // Convert to target unit
  mult = getMtMult(unitTo)
  var lengthOut = metres * mult

  return lengthOut
}

export default convertLength