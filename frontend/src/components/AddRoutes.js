import React, { Component } from 'react'

import AddRoutesRow from './AddRoutesRow'

export default class AddRoutes extends Component {

  STATE_INPUT = 1
  STATE_PROCESSING = 2

  constructor(props) {
    super(props)

    this.state = {
      status: this.STATE_INPUT,
      routeList: '',
      routes: []
    }
  }

  render() {
    var { routeList, routes, status } = this.state

    var routeTable = null

    if (routes.length > 0) {
      var rows = routes.map(r => {
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
              rows="6"
              value={routeList}
              onChange={(evt) => this.routeListChanged(evt)}
              disabled={status !== this.STATE_INPUT}
            />
          </div>
          <div className="form-group">
            <button
              type='submit'
              className='btn btn-primary'
              onClick={(evt) => this.process(evt)}
              disabled={status !== this.STATE_INPUT}
            >
              Process
            </button>
          </div>
        </form>

        {routeTable}
      </>
    )
  }

  process = (evt) => {
    evt.preventDefault()

    var { routeList, routes } = this.state

    var routeStrings = routeList.split('\n')

    var newRoutes = routeStrings
      .map((rs) => rs.match(/[0-9]*$/)[0])
      .reduce((arr, r) => {
        if (r !== '') {
          var ri = parseInt(r)
          if (ri > 0) arr.push({
            routeid: ri,
            processed: false
          })
        }
        return arr
      }, [])

    this.setState({
      status: this.STATE_PROCESSING,
      routes: routes.concat(newRoutes)
    })
  }

  routeListChanged = (evt) => {
    var routeList = evt.target.value

    this.setState({
      routeList
    })
  }

  finishNotify = (routeid) => {
    var { routes } = this.state

    var elem = routes.find((r) => r.routeid === routeid)
    elem.processed = true

    var firstProc = routes.find((r) => r.finished === false)
    if (!firstProc) {
      this.setState({
        status: this.STATE_INPUT,
        routeList: ''
      })  
    }
  }

}