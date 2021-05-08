import { Component, SyntheticEvent } from 'react'

import AddRoutesRow from './AddRoutesRow'

// Types

enum EStatus {
  STATE_INPUT = 1,
  STATE_PROCESSING = 2
}

interface IRoute {
  routeid: number
  processed: boolean
}

interface IProps {
}

interface IState {
  status: EStatus
  routeList: string
  routes: IRoute[]
}

// Class definition

export default class AddRoutes extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)

    this.state = {
      status: EStatus.STATE_INPUT,
      routeList: '',
      routes: []
    }
  }

  render() {
    const { routeList, routes, status } = this.state

    let routeTable = null

    if (routes.length > 0) {
      const rows = routes.map(r => {
        return <AddRoutesRow route={r} key={r.routeid} finishNotify={this.finishNotify}/>
      })

      routeTable = (
        <table className='table table-sm mt-2'>
          <thead>
            <tr>
              <th className='text-nowrap'>Link</th>
              <th className='text-nowrap'>Description</th>
              <th className='text-nowrap'>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows}
          </tbody>
        </table>
      )
    }

    return (
      <>
        <form className='mt-2'>
          <div className="form-group">
            <label htmlFor="routeList">Enter list of route IDs or strava route URLs:</label>
            <textarea
              className="form-control"
              id="routeList"
              rows={6}
              value={routeList}
              onChange={(evt) => this.routeListChanged(evt)}
              disabled={status !== EStatus.STATE_INPUT}
            />
          </div>
          <div className="form-group">
            <button
              type='submit'
              className='btn btn-primary'
              onClick={(evt) => this.process(evt)}
              disabled={status !== EStatus.STATE_INPUT}
            >
              Process
            </button>
          </div>
        </form>

        {routeTable}
      </>
    )
  }

  process = (evt: SyntheticEvent) => {
    evt.preventDefault()

    const { routeList, routes } = this.state

    const routeStrings = routeList.split('\n')

    const newRoutes = routeStrings.reduce((arr: IRoute[], rs) => {
      const rm = rs.match(/[0-9]*$/)
      
      if (rm){
        const r = rm[0]

        if (r && r !== '') {
          const ri = parseInt(r)
          if (ri > 0) arr.push({
            routeid: ri,
            processed: false
          })
        }
      }

      return arr
    }, [])

    this.setState({
      status: EStatus.STATE_PROCESSING,
      routes: routes.concat(newRoutes)
    })
  }

  routeListChanged = (evt: SyntheticEvent<HTMLTextAreaElement>) => {
    const routeList = evt.currentTarget.value

    this.setState({
      routeList
    })
  }

  finishNotify = (routeid: number) => {
    const { routes } = this.state

    const elem = routes.find((r) => r.routeid === routeid)

    if (elem) {
      elem.processed = true

      // All processed?
      const firstProc = routes.find((r) => r.processed === false)

      if (!firstProc) {
        // Yes - allow new input
        this.setState({
          status: EStatus.STATE_INPUT,
          routeList: ''
        })  
      }
    }
  }

}