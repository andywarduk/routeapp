import { Component } from 'react'
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

interface IProps {
}

interface IState {
  loading: number
  request: number
  routes: IRoute[],
  error: string | null
  sortCol: string
  sortAsc: boolean
  filter: IRouteSearchFilter,
  view: FilteredRoutesView,
  debounceTimer: NodeJS.Timeout | null
}

// Class definition

export default class FilteredRoutes extends Component<IProps, IState> {
  static contextType: typeof StravaContext = StravaContext
  context!: React.ContextType<typeof StravaContext>

  static debounceTime = 400 // 0.4 second debounce

  routeService: RouteService

  constructor(props: IProps) {
    super(props)

    // Initial state
    this.state = {
      loading: 0,
      request: 0,
      routes: [],
      error: null,
      sortCol: 'name',
      sortAsc: true,
      filter: {},
      view: FilteredRoutesView.VIEW_TABLE,
      debounceTimer: null
    }

    // Create route service
    this.routeService = new RouteService()
  }

  componentDidMount = () => {
    // Initial data request
    this.requestData({
      ...this.state
    })
  }

  requestData = async (newState: Partial<IState>) => {
    const { auth } = this.context

    if (auth) {
      const { jwt } = auth

      // Allocate request number
      const requestNo = this.state.request + 1

      // Build full state for search
      const srchState = {
        ...this.state,
        ...newState,
        loading: this.state.loading + 1,
        request: requestNo
      }

      // Set state
      this.setState(srchState)

      // Make request
      const res = await this.routeService.search(jwt, {
        columns: [
          'routeid',
          'name',
          'description',
          'distance',
          'elevation_gain',
          'estimated_moving_time'
        ],
        sort: {
          column: srchState.sortCol,
          ascending: srchState.sortAsc
        },
        filter: srchState.filter
      })

      // Process results
      let nextState: Partial<IState>

      if (requestNo >= this.state.request) {
        if (res.ok) {
          nextState = {
            routes: res.data,
            error: null,
            loading: Math.max(0, this.state.loading - 1)
          }

        } else {
          nextState = {
            routes: [],
            error: res.data.toString(),
            loading: Math.max(0, this.state.loading - 1)
          }

        }

      } else {
        nextState = {
          loading: Math.max(0, this.state.loading - 1)
        }

      }

      this.setState({
        ...this.state,
        ...nextState
      })

    }

  }

  sort = (col: string) => {
    const { sortCol, sortAsc } = this.state

    if (col === sortCol) {
      // Same column - reverse order
      this.requestData({
        sortAsc: !sortAsc
      })
    } else {
      // New column
      this.requestData({
        sortCol: col,
        sortAsc: true
      })
    }
  }

  tabSwitched = (newTab: FilteredRoutesView) => {
    this.setState({
      view: newTab
    })
  }

  filterChanged = (filter: IRouteSearchFilter, debounce: boolean) => {
    const { debounceTimer } = this.state

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (debounce) {
      // Debounced request
      this.setState({
        debounceTimer: setTimeout(() => {
          this.filterChanged(filter, false)
        }, FilteredRoutes.debounceTime),
        filter
      })
    } else {
      // Immediate request
      this.requestData({
        debounceTimer: null,
        filter
      })
    }
  }

  render = () => {
    const { routes, loading, error, sortCol, sortAsc, debounceTimer, view } = this.state

    let content = null 

    // Calculate spinner
    let spinner = null

    if (loading > 0) {
      spinner = <FontAwesomeIcon icon={faSpinner} spin={true}/>
    } else if (debounceTimer) {
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
          sortCb={this.sort}
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
        <Filter filterCb={this.filterChanged}/>
        <FilteredRoutesTab
          view={view}
          routes={routes}
          error={error}
          spinner={spinner}
          tabSwitched={this.tabSwitched}
        />
        {content}
      </>
    )
  }

}
