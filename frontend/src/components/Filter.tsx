import { SyntheticEvent, useRef, useState } from 'react'

import convertLength from '../LengthConv'
import { IRouteSearchFilter } from '../RouteService'

// Types

interface IProps {
  filterCb: (filter: IRouteSearchFilter, debounce: boolean) => void
}

interface IValues {
  distFrom_Value: string
  distTo_Value: string
  elevFrom_Value: string
  elevTo_Value: string
}

interface IUnits {
  distFrom_Unit: string
  distTo_Unit: string
  elevFrom_Unit: string
  elevTo_Unit: string
}

interface IValuesAndUnits extends IValues, IUnits {}

interface IFilterState extends IValuesAndUnits {
  srchText: string
}

interface Preset {
  desc: string
  colour: string
  values?: Partial<IValuesAndUnits>
}

type Presets = {
  [key: string]: Preset
}

// Constants

const distUnits = ['mi', 'km']
const elevUnits = ['ft', 'm']

const presets: Presets = {
  green: {
    desc: 'Green',
    colour: 'success',
    values: {
      distFrom_Value: '20',
      distFrom_Unit: 'mi',
      distTo_Value: '30',
      distTo_Unit: 'mi',
    }
  },
  orange: {
    desc: 'Orange',
    colour: 'warning',
    values: {
      distFrom_Value: '30',
      distFrom_Unit: 'mi',
      distTo_Value: '60',
      distTo_Unit: 'mi',
    }
  },
  blue: {
    desc: 'Blue / Red',
    colour: 'danger',
    values: {
      distFrom_Value: '40',
      distFrom_Unit: 'mi',
      distTo_Value: '100',
      distTo_Unit: 'mi',
    }
  },
  clear: {
    desc: 'Reset',
    colour: 'secondary'
  }
}

const defaultValues = (): IValues => {
  return {
    distFrom_Value: '',
    distTo_Value: '',
    elevFrom_Value: '',
    elevTo_Value: '',
  }
}

const initialState = (): IFilterState => {
  return {
    ...defaultValues(),
    srchText: '',
    distFrom_Unit: distUnits[0],
    distTo_Unit: distUnits[0],
    elevFrom_Unit: elevUnits[0],
    elevTo_Unit: elevUnits[0]
  }
}

// Component

export default function Filter({ filterCb }: IProps) {
  const [state, setState] = useState<IFilterState>(initialState)

  // The callback only fires when the filter itself changes, so the last one
  // built is kept outside of state
  const lastFilter = useRef<IRouteSearchFilter>({})

  const filter = (newState: Partial<IFilterState>, debounce: boolean) => {
    const filter: IRouteSearchFilter = {}

    const nextState = {
      ...state,
      ...newState
    }

    if (nextState.srchText !== '') {
      filter.srchText = nextState.srchText
      filter.partialWord = true
    }

    if (nextState.distFrom_Value !== '')
      filter.distFrom = convertLength(parseFloat(nextState.distFrom_Value), nextState.distFrom_Unit, 'm')

    if (nextState.distTo_Value !== '')
      filter.distTo = convertLength(parseFloat(nextState.distTo_Value), nextState.distTo_Unit, 'm')

    if (nextState.elevFrom_Value !== '')
      filter.elevFrom = convertLength(parseFloat(nextState.elevFrom_Value), nextState.elevFrom_Unit, 'm')

    if (nextState.elevTo_Value !== '')
      filter.elevTo = convertLength(parseFloat(nextState.elevTo_Value), nextState.elevTo_Unit, 'm')

    setState(nextState)

    if (JSON.stringify(filter) !== JSON.stringify(lastFilter.current)) {
      lastFilter.current = filter

      if (filterCb) {
        filterCb(filter, debounce)
      }
    }
  }

  const loadPreset = (evt: SyntheticEvent, presetName: keyof Presets) => {
    evt.preventDefault()

    const preset = presets[presetName]
    const { values = {} } = preset

    const newState = {
      ...state,
      ...defaultValues(),
      ...values
    }

    // Convert units
    const convert = (valKey: keyof IValues, unitKey: keyof IUnits) => {
      if (state[unitKey] !== newState[unitKey]) {
        newState[valKey] = '' + Math.floor(convertLength(parseFloat(newState[valKey]), newState[unitKey], state[unitKey]))
        newState[unitKey] = state[unitKey]
      }
    }

    convert('distFrom_Value', 'distFrom_Unit')
    convert('distTo_Value', 'distTo_Unit')
    convert('elevFrom_Value', 'elevFrom_Unit')
    convert('elevTo_Value', 'elevTo_Unit')

    filter(newState, false)
  }

  const dropDownChanged = (id: keyof IUnits, elem: string) => {
    filter({ [id]: elem }, false)
  }

  const inputChanged = (id: keyof IValues, evt: SyntheticEvent<HTMLInputElement>) => {
    let value
    const valNum = parseFloat(evt.currentTarget.value)

    if (valNum === 0 || isNaN(valNum)) value = ''
    else value = '' + valNum

    filter({ [id]: value }, true)
  }

  const textChanged = (evt: SyntheticEvent<HTMLInputElement>) => {
    filter({ srchText: evt.currentTarget.value }, true)
  }

  const unitInput = (placeholder: string, value: keyof IValues, unit: keyof IUnits, dropdown: string[]) => {
    const unitMenuItems = dropdown.map((elem, idx) => {
      return (
        <button
          key={idx}
          type='button'
          role='menuitem'
          className='dropdown-item'
          onClick={() => dropDownChanged(unit, elem)}
        >
          {elem}
        </button>
      )
    })

    return (
      <div className='col-12 col-sm-6 col-md-4 col-lg-3'>
        <div className='input-group my-1'>
          <input
            type='text'
            id={value}
            className='form-control'
            placeholder={placeholder}
            onChange={(evt) => inputChanged(value, evt)}
            value={state[value]}
          />
          <button
            type='button'
            className='btn btn-secondary dropdown-toggle'
            data-bs-toggle='dropdown'
            aria-expanded='false'
          >
            {state[unit]}
          </button>
          <div className='dropdown-menu' role='menu'>
            {unitMenuItems}
          </div>
        </div>
      </div>
    )
  }

  // Build preset buttons
  const presetButtons = []

  for (const presetName in presets) {
    const preset = presets[presetName]

    presetButtons.push(
      <button
        key={presetName}
        type='button'
        className={`my-1 me-1 btn btn-${preset.colour}`}
        onClick={(evt: SyntheticEvent) => loadPreset(evt, presetName)}
      >
        {preset.desc}
      </button>
    )
  }

  // Build form
  return (
    <form>

      <div className='row'>
        <div className='col-12 mt-1'>
          <input
            id='srchText'
            className='form-control my-1'
            placeholder='Search Text'
            onChange={(evt) => textChanged(evt)}
            value={state.srchText}
          />
        </div>
      </div>

      <div className='row'>
        <div className='col-12 mt-1'>
          {presetButtons}
        </div>
      </div>

      <div className='row'>
        <div className='col-12'>
          <label htmlFor='distFrom' className='my-1'>Distance</label>
        </div>
      </div>

      <div className='row'>
        {unitInput('Distance From', 'distFrom_Value', 'distFrom_Unit', distUnits)}
        {unitInput('Distance To', 'distTo_Value', 'distTo_Unit', distUnits)}
      </div>

      <div className='row'>
        <div className='col-12'>
          <label htmlFor='elevFrom' className='my-1'>Elevation</label>
        </div>
      </div>

      <div className='row'>
        {unitInput('Elevation From', 'elevFrom_Value', 'elevFrom_Unit', elevUnits)}
        {unitInput('Elevation To', 'elevTo_Value', 'elevTo_Unit', elevUnits)}
      </div>

    </form>
  )
}
