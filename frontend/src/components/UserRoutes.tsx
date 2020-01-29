import React, { Component } from 'react'
import { Switch, Route, withRouter, RouteComponentProps } from 'react-router-dom'

import Users from './Users'
import UserDetail from './UserDetail'

class UserRoutes extends Component<RouteComponentProps> {

  render() {
    const { match } = this.props

    return (
      <Switch>
        <Route path={`${match.path}/`} component={Users} exact/>
        <Route path={`${match.path}/:userId`} component={UserDetail} exact/>
      </Switch>
    )
  }

}

export default withRouter(UserRoutes)
