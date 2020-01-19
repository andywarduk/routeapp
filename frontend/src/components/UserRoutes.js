import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import Users from './Users'
import UserDetail from './UserDetail'

class UserRoutes extends Component {

  render() {
    var { match } = this.props

    return (
      <Switch>
        <Route path={`${match.path}/`} component={Users} exact/>
        <Route path={`${match.path}/:userId`} component={UserDetail} exact/>
      </Switch>
    )
  }

}

export default withRouter(UserRoutes)
