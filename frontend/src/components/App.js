import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import StravaGateway from './StravaGateway'
import Main from './Main'
import Page from './Page'

function App() {
  return (
    <BrowserRouter>
      <StravaGateway HoldPage={Page}>
        <Main/>
      </StravaGateway>
    </BrowserRouter>
  )
}

export default App
