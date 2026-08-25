import { Routes, Route } from 'react-router-dom'

import Users from './Users'
import UserDetail from './UserDetail'

/*
 * Mounted by Main under /users/*, so these paths are relative to that.
 */
export default function UserRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Users/>}/>
      <Route path=':userId' element={<UserDetail/>}/>
    </Routes>
  )
}
