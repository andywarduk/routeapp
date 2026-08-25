import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Main from './Main'
import StravaContext, { IStravaContext } from './StravaContext'
import { IPermissionList } from '../Permissions'

// The route/user lists fetch on mount; this keeps the tests off the network
vi.mock('../RouteService', () => ({
  default: class {
    search = async () => ({ ok: true, data: [] })
    getPolyline = async () => ({ ok: true, data: '' })
    getSummaryPolyline = async () => ({ ok: true, data: '' })
  }
}))

vi.mock('../UserService', () => ({
  default: class {
    search = async () => ({ ok: true, data: [] })
  }
}))

const renderAt = (path: string, perms: IPermissionList) => {
  const context: IStravaContext = {
    auth: {
      jwt: 'test-jwt',
      picMed: '',
      fullName: 'Test User',
      perms
    },
    getCachedPolyLine: async () => null,
    getCachedSummaryPolyLine: async () => null
  }

  return render(
    <MemoryRouter initialEntries={[path]}>
      <StravaContext.Provider value={context}>
        <Main/>
      </StravaContext.Provider>
    </MemoryRouter>
  )
}

describe('Main routing', () => {
  it('renders the app chrome', () => {
    renderAt('/', { viewRoutes: true })
    expect(screen.getByText(/CCC Route Finder/)).toBeInTheDocument()
  })

  it('shows no nav links for a view-only user', () => {
    renderAt('/', { viewRoutes: true })
    expect(screen.queryByText('Add')).not.toBeInTheDocument()
    expect(screen.queryByText('Users')).not.toBeInTheDocument()
  })

  it('shows edit links for a user who can modify routes', () => {
    renderAt('/', { viewRoutes: true, modifyRoutes: true })
    expect(screen.getByText('Add')).toBeInTheDocument()
    expect(screen.getByText('Maintain')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('shows the users link for an admin', () => {
    renderAt('/', { admin: true })
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders a matched leaf route', () => {
    renderAt('/add', { modifyRoutes: true })
    expect(screen.getByText(/Enter list of route IDs/)).toBeInTheDocument()
  })

  it('falls through to the catch-all for an unknown path', () => {
    renderAt('/nowhere', { viewRoutes: true })
    expect(screen.getByText(/Page not found/)).toBeInTheDocument()
  })

  it('denies a route the user lacks permission for', () => {
    // /add is only registered when modifyRoutes is held
    renderAt('/add', { viewRoutes: true })
    expect(screen.getByText(/Page not found/)).toBeInTheDocument()
  })

  it('matches a nested route under the descendant-matching /users/* path', () => {
    renderAt('/users', { admin: true })
    expect(screen.queryByText(/Page not found/)).not.toBeInTheDocument()
    expect(screen.getByText('Athlete')).toBeInTheDocument()
  })
})
