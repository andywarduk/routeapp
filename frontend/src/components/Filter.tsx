import React, { Component, SyntheticEvent } from 'react'

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

interface IState extends IValuesAndUnits {
  srchText: string
  lastFilter: IRouteSearchFilter | {}
}

interface Preset {
  desc: string
  colour: string
  values?: Partial<IValuesAndUnits>
}

type Presets = {
  [key: string]: Preset
}

// Class definition

export default class Filter extends Component<IProps, IState> {

  static distUnits = ['mi', 'km']
  static elevUnits = ['ft', 'm']

  static presets: Presets = {
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

  constructor(props: IProps) {
    super(props)

    this.state = {
      ...this.defaultValues(),
      srchText: '',
      distFrom_Unit: Filter.distUnits[0],
      distTo_Unit: Filter.distUnits[0],
      elevFrom_Unit: Filter.elevUnits[0],
      elevTo_Unit: Filter.elevUnits[0],
      lastFilter: {}
    }
  }

  defaultValues = (): IValues => {
    return {
      distFrom_Value: '',
      distTo_Value: '',
      elevFrom_Value: '',
      elevTo_Value: '',
    }
  }

  loadPreset = (evt: SyntheticEvent, presetName: keyof Presets) => {
    evt.preventDefault()

    const preset = Filter.presets[presetName]
    const { values = {} } = preset

    const newState = {
      ...this.state,
      ...this.defaultValues(),
      ...values
    }

    // Convert units
    const convert = (valKey: keyof IValues, unitKey: keyof IUnits) => {
      if (this.state[unitKey] !== newState[unitKey]) {
        newState[valKey] = '' + Math.floor(convertLength(parseFloat(newState[valKey]), newState[unitKey], this.state[unitKey]))
        newState[unitKey] = this.state[unitKey]
      }
    }

    convert('distFrom_Value', 'distFrom_Unit')
    convert('distTo_Value', 'distTo_Unit')
    convert('elevFrom_Value', 'elevFrom_Unit')
    convert('elevTo_Value', 'elevTo_Unit')

    this.filter(newState, false)
  }

  dropDownChanged = (id: keyof IUnits, elem: string) => {
    const newState = {
      [id]: elem
    }

    this.filter(newState, false)
  }

  inputChanged = (id: keyof IValues, evt: SyntheticEvent<HTMLInputElement>) => {
    let value
    const valNum = parseFloat(evt.currentTarget.value)

    if (valNum === 0 || isNaN(valNum)) value = ''
    else value = '' + valNum

    const newState = {
      [id]: value
    }

    this.filter(newState, true)
  }

  textChanged = (evt: SyntheticEvent<HTMLInputElement>) => {
    const newState = {
      srchText: evt.currentTarget.value
    }

    this.filter(newState, true)
  }

  unitInput = (placeholder: string, value: keyof IValues, unit: keyof IUnits, dropdown: string[]) => {
    const unitMenuItems = dropdown.map((elem, idx) => {
      return (
        <button
          key={idx}
          type='button'
          role='menuitem'
          className='dropdown-item'
          onClick={() => this.dropDownChanged(unit, elem)}
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
            onChange={(evt) => this.inputChanged(value, evt)}
            value={this.state[value]}
          />
          <div className='input-group-append'>
            <button
              type='button'
              className='btn btn-secondary dropdown-toggle'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              {this.state[unit]}
            </button>
            <div className='dropdown-menu' role='menu'>
              {unitMenuItems}
            </div>
          </div>
        </div>
      </div>
    )
  }

  filter = (newState: Partial<IState>, debounce: boolean) => {
    const { filterCb } = this.props

    const filter: IRouteSearchFilter = {}

    const state = {
      ...this.state,
      ...newState
    }

    if (state.srchText !== '') {
      filter.srchText = state.srchText
      filter.partialWord = true
    }

    if (state.distFrom_Value !== '')
      filter.distFrom = convertLength(parseFloat(state.distFrom_Value), state.distFrom_Unit, 'm')

    if (state.distTo_Value !== '')
      filter.distTo = convertLength(parseFloat(state.distTo_Value), state.distTo_Unit, 'm')

    if (state.elevFrom_Value !== '')
      filter.elevFrom = convertLength(parseFloat(state.elevFrom_Value), state.elevFrom_Unit, 'm')

    if (state.elevTo_Value !== '')
      filter.elevTo = convertLength(parseFloat(state.elevTo_Value), state.elevTo_Unit, 'm')

    if (JSON.stringify(filter) !== JSON.stringify(state.lastFilter)) {
      state.lastFilter = filter
      this.setState(state)

      if (filterCb) {
        filterCb(filter, debounce)
      }
    } else {
      this.setState(state)
    }
  }

  render() {
    const { srchText } = this.state

    // Build preset buttons
    const presetButtons = []

    for (const presetName in Filter.presets) {
      const preset = Filter.presets[presetName]

      const onClickFn = ((presetName) => {
        return (evt: SyntheticEvent) => this.loadPreset(evt, presetName)
      })(presetName)

      presetButtons.push(
        <button
          key={presetName}
          type='button'
          className={`my-1 mr-1 btn btn-${preset.colour}`}
          onClick={onClickFn}
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
              onChange={(evt) => this.textChanged(evt)}
              value={srchText}
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
          {this.unitInput('Distance From', 'distFrom_Value', 'distFrom_Unit', Filter.distUnits)}
          {this.unitInput('Distance To', 'distTo_Value', 'distTo_Unit', Filter.distUnits)}
        </div>

        <div className='row'>
          <div className='col-12'>
            <label htmlFor='elevFrom' className='my-1'>Elevation</label>
          </div>
        </div>

        <div className='row'>
          {this.unitInput('Elevation From', 'elevFrom_Value', 'elevFrom_Unit', Filter.elevUnits)}
          {this.unitInput('Elevation To', 'elevTo_Value', 'elevTo_Unit', Filter.elevUnits)}
        </div>

      </form>
    )

  }

}
