import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faKeyboard } from '@fortawesome/free-solid-svg-icons'

import FilteredRoutesTab from './FilteredRoutesTab'
import RouteTable from './RouteTable'
import RouteMap from './RouteMap'
import RouteService, { IRouteSearchFilter, IRoute } from '../RouteService'
import Filter from './Filter'
import StravaContext from './StravaContext'

// Types

export enum FilteredRoutesView {
  VIEW_TABLE = 1,
  VIEW_MAP = 2
}

// Service

const routeService = new RouteService()

const debounceTime = 400 // 0.4 second debounce

// Component

export default function FilteredRoutes() {
  const { auth } = useContext(StravaContext)

  const [loading, setLoading] = useState(0)
  const [routes, setRoutes] = useState<IRoute[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [filter, setFilter] = useState<IRouteSearchFilter>({})
  const [view, setView] = useState(FilteredRoutesView.VIEW_TABLE)
  const [debouncing, setDebouncing] = useState(false)

  // Request number of the most recently issued search, so that results
  // arriving out of order can be discarded
  const request = useRef(0)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const jwt = auth ? auth.jwt : null

  // Search whenever the sort order or the applied filter changes, and on mount
  useEffect(() => {
    if (!jwt) return

    const requestData = async () => {
      // Allocate request number
      const requestNo = request.current + 1
      request.current = requestNo

      setLoading((l) => l + 1)

      // Make request
      const res = await routeService.search(jwt, {
        columns: [
          'routeid',
          'name',
          'description',
          'distance',
          'elevation_gain',
          'estimated_moving_time'
        ],
        sort: {
          column: sortCol,
          ascending: sortAsc
        },
        filter
      })

      // Process results, ignoring any superseded by a later request
      if (requestNo >= request.current) {
        if (res.ok) {
          setRoutes(res.data)
          setError(null)

        } else {
          setRoutes([])
          setError(res.data.toString())

        }
      }

      setLoading((l) => Math.max(0, l - 1))
    }

    requestData()
  }, [jwt, sortCol, sortAsc, filter])

  // Drop any outstanding debounce when unmounting
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  const sort = useCallback((col: string) => {
    if (col === sortCol) {
      // Same column - reverse order
      setSortAsc(!sortAsc)
    } else {
      // New column
      setSortCol(col)
      setSortAsc(true)
    }
  }, [sortCol, sortAsc])

  const filterChanged = useCallback((newFilter: IRouteSearchFilter, debounce: boolean) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = null
    }

    if (debounce) {
      // Debounced request
      setDebouncing(true)

      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null
        setDebouncing(false)
        setFilter(newFilter)
      }, debounceTime)

    } else {
      // Immediate request
      setDebouncing(false)
      setFilter(newFilter)

    }
  }, [])

  let content = null

  // Calculate spinner
  let spinner = null

  if (loading > 0) {
    spinner = <FontAwesomeIcon icon={faSpinner} spin={true}/>
  } else if (debouncing) {
    spinner = <FontAwesomeIcon icon={faKeyboard}/>
  }

  // Generate content for the current view
  switch (view) {
  case FilteredRoutesView.VIEW_TABLE:
    if (routes.length > 0) {
      content = <RouteTable
        routes={routes}
        sortCol={sortCol}
        sortAsc={sortAsc}
        sortCb={sort}
      />
    }

    break

  case FilteredRoutesView.VIEW_MAP:
    content = (
      <RouteMap routes={routes}/>
    )

    break

  default:
    break

  }

  return (
    <>
      <Filter filterCb={filterChanged}/>
      <FilteredRoutesTab
        view={view}
        routes={routes}
        error={error}
        spinner={spinner}
        tabSwitched={setView}
      />
      {content}
    </>
  )
}
