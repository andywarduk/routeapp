import React, { Component } from 'react'
import { Row, Col, Table } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import RouteService from '../RouteService'
import UpdateTableRow from './UpdateTableRow'

export default class UpdateTable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      error: null,
      routes: []
    }

    this.routeService = new RouteService()
  }

  componentDidMount = async () => {
    // Make request
    var res = await this.routeService.search({
      columns: ['routeid', 'name', 'updatedAt']
    })

    // Process results
    if (res.ok) {
      this.setState({
        routes: res.data,
        error: null,
        loading: false
      })
    } else {
      this.setState({
        error: res.data,
        loading: false
      })
    }
  }

  render() {
    var { loading, error, routes } = this.state

    if (loading) {
      return (
        <Row>
          <Col>Loading...&nbsp;<FontAwesomeIcon icon={faSpinner} spin={true}/></Col>
        </Row>
      )

    } else if (error){
      return (
        <Row>
          <Col>{error.toString()}</Col>
        </Row>
      )

    }

    var rows = routes.map(r => {
      return <UpdateTableRow route={r} key={r.routeid} />
    })

    return (
      <Table size='sm' className='mt-2'>
        <thead>
          <tr>
            <th className='text-nowrap'>Id</th>
            <th className='text-nowrap'>Name</th>
            <th className='text-nowrap'>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    )
  }

}