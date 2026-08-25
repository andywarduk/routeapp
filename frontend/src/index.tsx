import { createRoot } from 'react-dom/client'

import './index.css'
import App from './components/App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'leaflet/dist/leaflet.css'

const container = document.getElementById('root')

if (!container) throw new Error('Root element not found')

createRoot(container).render(<App />)
