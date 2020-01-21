import React, { Component } from 'react'

import convertLength from '../LengthConv'

export default class Filter extends Component {

  distUnits = ['mi', 'km']
  elevUnits = ['ft', 'm']

  presets = {
    green: {
      desc: 'Green',
      colour: 'success',
      values: {
        distFrom: [20, 'mi'],
        distTo: [30, 'mi']
      }
    },
    orange: {
      desc: 'Orange',
      colour: 'warning',
      values: {
        distFrom: [30, 'mi'],
        distTo: [60, 'mi']
      }
    },
    blue: {
      desc: 'Blue / Red',
      colour: 'danger',
      values: {
        distFrom: [40, 'mi'],
        distTo: [100, 'mi']
      }
    },
    clear: {
      desc: 'Reset',
      colour: 'secondary'
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      ...this.defaultState(),
      srchText: '',
      distFrom_Unit: this.distUnits[0],
      distTo_Unit: this.distUnits[0],
      elevFrom_Unit: this.elevUnits[0],
      elevTo_Unit: this.elevUnits[0],
      lastFilter: {}
    }
  }

  defaultState = () => {
    return {
      distFrom_Value: '',
      distTo_Value: '',
      elevFrom_Value: '',
      elevTo_Value: '',
    }
  }

  loadPreset = (evt, presetName) => {
    var preset = this.presets[presetName]

    var newState = {
      ...this.defaultState()
    }

    var values = preset.values || {}

    for (var prop in values) {
      newState[prop + '_Value'] = Math.floor(convertLength(values[prop][0], values[prop][1], this.state[prop + '_Unit']))
    }

    this.setState(newState)

    this.filter(newState, false)

    evt.preventDefault()
  }

  dropDownChanged = (id, elem) => {
    var newState = {
      [id + '_Unit']: elem
    }

    this.setState(newState)

    this.filter(newState, false)
  }

  inputChanged = (id, evt) => {
    var value = parseInt(evt.target.value)
    if (value === 0 || isNaN(value)) value = ''

    var newState = {
      [id + '_Value']: value
    }

    this.setState(newState)

    this.filter(newState, true)
  }

  textChanged = (evt) => {
    var newState = {
      srchText: evt.target.value
    }

    this.setState(newState)

    this.filter(newState, true)
  }

  unitInput = (placeholder, id, dropdown) => {
    var unitMenuItems = dropdown.map((elem, idx) => {
      return (
        <button
          key={idx}
          type='button'
          role='menuitem'
          className='dropdown-item'
          onClick={(evt) => this.dropDownChanged(id, elem)}
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
            id={id}
            className='form-control'
            placeholder={placeholder}
            onChange={(evt) => this.inputChanged(id, evt)}
            value={this.state[id + '_Value']}
          />
          <div className='input-group-append'>
            <button
              type='button'
              className='btn btn-secondary dropdown-toggle'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              {this.state[id + '_Unit']}
            </button>
            <div className='dropdown-menu' role='menu'>
              {unitMenuItems}
            </div>
          </div>
        </div>
      </div>
    )
  }

  filter = (newState, debounce) => {
    var { filterCb } = this.props

    var filter = {}

    var state = {
      ...this.state,
      ...newState
    }

    if (state.srchText !== '')
      filter.srchText = state.srchText

    if (state.distFrom_Value !== '')
      filter.distFrom = convertLength(state.distFrom_Value, state.distFrom_Unit, 'm')
    if (state.distTo_Value !== '')
      filter.distTo = convertLength(state.distTo_Value, state.distTo_Unit, 'm')
    if (state.elevFrom_Value !== '')
      filter.elevFrom = convertLength(state.elevFrom_Value, state.elevFrom_Unit, 'm')
    if (state.elevTo_Value !== '')
      filter.elevTo = convertLength(state.elevTo_Value, state.elevTo_Unit, 'm')

    if (JSON.stringify(filter) !== JSON.stringify(state.filter)) {
      this.setState({
        lastFilter: filter
      })

      if (filterCb) {
        filterCb(filter, debounce)
      }
    }
  }

  render() {
    var { srchText } = this.state

    // Build preset buttons
    var presetButtons = []

    for (var presetName in this.presets) {
      var preset = this.presets[presetName]

      var onClickFn = ((presetName) => {
        return (evt) => this.loadPreset(evt, presetName)
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
          {this.unitInput('Distance From', 'distFrom', this.distUnits)}
          {this.unitInput('Distance To', 'distTo', this.distUnits)}
        </div>

        <div className='row'>
          <div className='col-12'>
            <label htmlFor='elevFrom' className='my-1'>Elevation</label>
          </div>
        </div>

        <div className='row'>
          {this.unitInput('Elevation From', 'elevFrom', this.elevUnits)}
          {this.unitInput('Elevation To', 'elevTo', this.elevUnits)}
        </div>

      </form>
    )

  }

}
