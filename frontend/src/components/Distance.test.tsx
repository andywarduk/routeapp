import React from 'react'
import { render } from '@testing-library/react'
import Distance from './Distance'

test('Renders null Distance', () => {
  const { getByText } = render(<Distance/>)
  const distString = getByText('0 m')
  expect(distString).toBeInTheDocument()
})

test('Renders 10m Distance', () => {
  const { getByText } = render(<Distance m={10}/>)
  const distString = getByText('10 m')
  expect(distString).toBeInTheDocument()
})

test('Renders (10/3)m Distance to 0 dp', () => {
  const { getByText } = render(<Distance m={10/3}/>)
  const distString = getByText('3 m')
  expect(distString).toBeInTheDocument()
})

test('Renders (20/3)m Distance to 0 dp', () => {
  const { getByText } = render(<Distance m={20/3}/>)
  const distString = getByText('7 m')
  expect(distString).toBeInTheDocument()
})

test('Renders (10/3)m Distance to 2 dp', () => {
  const { getByText } = render(<Distance m={10/3} dp={2}/>)
  const distString = getByText('3.33 m')
  expect(distString).toBeInTheDocument()
})

test('Renders (20/3)m Distance to 2 dp', () => {
  const { getByText } = render(<Distance m={20/3} dp={2}/>)
  const distString = getByText('6.67 m')
  expect(distString).toBeInTheDocument()
})

test('Renders 123m Distance to -2 dp', () => {
  const { getByText } = render(<Distance m={123} dp={-2}/>)
  const distString = getByText('100 m')
  expect(distString).toBeInTheDocument()
})

test('Renders 456m Distance to 2 dp', () => {
  const { getByText } = render(<Distance m={456} dp={-2}/>)
  const distString = getByText('500 m')
  expect(distString).toBeInTheDocument()
})

test('Renders 10m Distance with no unit', () => {
  const { getByText } = render(<Distance m={10} showUnit={false}/>)
  const distString = getByText('10')
  expect(distString).toBeInTheDocument()
})

test('Renders 1000m Distance in feet', () => {
  const { getByText } = render(<Distance m={1000} unit='ft'/>)
  const distString = getByText('3281 ft')
  expect(distString).toBeInTheDocument()
})

test('Renders 1000m Distance in miles, 4dp', () => {
  const { getByText } = render(<Distance m={1000} unit='mi' dp={4}/>)
  const distString = getByText('0.6214 mi')
  expect(distString).toBeInTheDocument()
})
