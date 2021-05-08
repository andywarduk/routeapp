import { render } from '@testing-library/react'
import App from './App'

test('Renders App with title', () => {
  const { getByText } = render(<App/>)
  const title = getByText(/CCC Route Finder/i)
  expect(title).toBeInTheDocument()
})
