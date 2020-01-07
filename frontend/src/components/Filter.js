import React, { Component } from 'react'
import {
  Button, Form, Input, Label, Row, Col, 
  InputGroup, InputGroupButtonDropdown, DropdownToggle,
  DropdownMenu, DropdownItem
} from 'reactstrap'

import convertLength from '../LengthConv'

export default class Filter extends Component {

  distUnits = ['mi', 'km']
  elevUnits = ['ft', 'mt']

  presets = {
    orange: {
      distFrom: [20, 'mi'],
      distTo: [30, 'mi'] 
    },
    green: {
      distFrom: [30, 'mi'],
      distTo: [60, 'mi'] 
    },
    blue: {
      distFrom: [40, 'mi'],
      distTo: [100, 'mi'] 
    },
    clear: {}
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
      distFrom_DropDownOpen: false,
      distTo_Value: '',
      distTo_DropDownOpen: false,
      elevFrom_Value: '',
      elevFrom_DropDownOpen: false,
      elevTo_Value: '',
      elevTo_DropDownOpen: false
    }
  }

  loadPreset = (evt, presetName) => {
    var preset = this.presets[presetName]

    var newState = {
      ...this.defaultState()
    }

    for (var prop in preset) {
      newState[prop + '_Value'] = Math.floor(convertLength(preset[prop][0], preset[prop][1], this.state[prop + '_Unit']))
    }

    this.setState(newState)

    this.filter(newState)

    evt.preventDefault()
  }

  toggleDropDown = (id) => {
    this.setState({
      [id + '_DropDownOpen']: !this.state[id + '_DropDownOpen']
    })
  }

  dropDownChanged = (id, elem) => {
    var newState = {
      [id + '_Unit']: elem
    }

    this.setState(newState)

    this.filter(newState)
  }

  inputChanged = (id, evt) => {
    var value = parseInt(evt.target.value)
    if (value === 0 || isNaN(value)) value = ''

    var newState = {
      [id + '_Value']: value
    }

    this.setState(newState)

    this.filter(newState)
  }

  textChanged = (evt) => {
    var newState = {
      srchText: evt.target.value
    }

    this.setState(newState)

    this.filter(newState)
  }

  unitInput = (placeholder, id, dropdown) => {
    var menu = dropdown.map((elem, idx) => {
      return (
        <DropdownItem
          key={idx}
          onClick={(evt) => this.dropDownChanged(id, elem)}
        >
          {elem}
        </DropdownItem>
      )
    })

    return (
      <Col xs='6' md='3'>
        <InputGroup>
          <Input
            placeholder={placeholder}
            id={id}
            onChange={(evt) => this.inputChanged(id, evt)}
            value={this.state[id + '_Value']}
          />
          <InputGroupButtonDropdown
            addonType="append"
            isOpen={this.state[id + '_DropDownOpen']}
            toggle={() => this.toggleDropDown(id)}
          >
            <DropdownToggle caret>
              {this.state[id + '_Unit']}
            </DropdownToggle>
            <DropdownMenu>
              {menu}
            </DropdownMenu>
          </InputGroupButtonDropdown>
        </InputGroup>
      </Col>
    )
  }

  filter = (newState) => {
    var filter = {}

    var state = {
      ...this.state,
      ...newState
    }

    if (state.srchText !== '')
      filter.srchText = state.srchText

    if (state.distFrom_Value !== '')
      filter.distFrom = convertLength(state.distFrom_Value, state.distFrom_Unit, 'mt')
    if (state.distTo_Value !== '')
      filter.distTo = convertLength(state.distTo_Value, state.distTo_Unit, 'mt')
    if (state.elevFrom_Value !== '')
      filter.elevFrom = convertLength(state.elevFrom_Value, state.elevFrom_Unit, 'mt')
    if (state.elevTo_Value !== '')
      filter.elevTo = convertLength(state.elevTo_Value, state.elevTo_Unit, 'mt')

    if (JSON.stringify(filter) !== JSON.stringify(state.filter)) {
      this.setState({
        lastFilter: filter
      })

      if (this.props.filterCb) {
        this.props.filterCb(filter)
      }
    }
  }

  render() {
    return (
      <>
        <Form>
          <Row>
            <Col className='mt-2' xs='12'>
              <Input
                placeholder='Search Text'
                id='srchText'
                onChange={(evt) => this.textChanged(evt)}
                value={this.state.srchText}
              />
            </Col>
          </Row>
          <Row>
            <Col className='mt-3' xs='12'>
              <Button className='ml-0' color='warning' onClick={(evt) => this.loadPreset(evt, 'orange')}>Orange</Button>
              <Button className='ml-1' color='success' onClick={(evt) => this.loadPreset(evt, 'green')}>Green</Button>
              <Button className='ml-1' color='primary' onClick={(evt) => this.loadPreset(evt, 'blue')}>Blue / Red</Button>
              <Button className='ml-1' onClick={(evt) => this.loadPreset(evt, 'clear')}>Reset</Button>
            </Col>
          </Row>
          <Row>
            <Col className='mt-2' xs='12'>
              <Label for='distFrom'>Distance</Label>
            </Col>
          </Row>
          <Row>
            {this.unitInput('Distance From', 'distFrom', this.distUnits)}
            {this.unitInput('Distance To', 'distTo', this.distUnits)}
          </Row>
          <Row>
            <Col className='mt-2' xs='12'>
              <Label for='elevFrom'>Elevation</Label>
            </Col>
          </Row>
          <Row>
            {this.unitInput('Elevation From', 'elevFrom', this.elevUnits)}
            {this.unitInput('Elevation To', 'elevTo', this.elevUnits)}
          </Row>
        </Form>
      </>
    )

  }

}
