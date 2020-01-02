import React, { Component } from 'react'
import {
  Button, Form, Input, Label, Row, Col, 
  InputGroup, InputGroupButtonDropdown, DropdownToggle,
  DropdownMenu, DropdownItem
} from 'reactstrap'

export default class Filter extends Component {

  distUnits = ['mi', 'km']
  elevUnits = ['ft', 'mt']

  // TODO
  presets = {
    orange: {

    },
    green: {

    },
    blue: {

    }
  }

  constructor(props) {
    super(props)

    this.state = this.defaultState()
  }

  defaultState = () => {
    return {
      distFrom_Value: '',
      distFrom_Unit: this.distUnits[0],
      distFrom_DropDownOpen: false,
      distTo_Value: '',
      distTo_Unit: this.distUnits[0],
      distTo_DropDownOpen: false,
      elevFrom_Value: '',
      elevFrom_Unit: this.elevUnits[0],
      elevFrom_DropDownOpen: false,
      elevTo_Value: '',
      elevTo_Unit: this.elevUnits[0],
      elevTo_DropDownOpen: false
    }
  }

  loadPreset = (evt, presetName) => {
    var preset = this.presets[presetName]

    var newState = this.defaultState()

    // TODO

    this.setState(newState)

    evt.preventDefault()
  }

  toggleDropDown = (id) => {
    this.setState({
      [id + '_DropDownOpen']: !this.state[id + '_DropDownOpen']
    })
  }

  dropDownChanged = (id, elem) => {
    this.setState({
      [id + '_Unit']: elem
    })
  }

  inputChanged = (id, evt) => {
    var value = parseInt(evt.target.value)
    if (value === 0 || isNaN(value)) value = ''
    this.setState({
      [id + '_Value']: value
    })
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

  render() {
    return (
      <>
        <Form>
          <Row>
            <Col className='mt-3' xs='12'>
              <Button className='ml-0' color='warning' onClick={(evt) => this.loadPreset(evt, 'orange')}>Orange</Button>
              <Button className='ml-1' color='success' onClick={(evt) => this.loadPreset(evt, 'green')}>Green</Button>
              <Button className='ml-1' color='primary' onClick={(evt) => this.loadPreset(evt, 'blue')}>Blue / Red</Button>
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
        <br/>
      </>
    )

  }

}
