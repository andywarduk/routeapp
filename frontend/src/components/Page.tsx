import { ReactNode } from 'react'

import Nav from './Nav'

// Types

interface IProps {
  navContent?: ReactNode
  children?: ReactNode
}

// Component

export default function Page({ children, navContent }: IProps) {
  return (
    <>
      <Nav>
        {navContent}
      </Nav>

      <div className='container-fluid'>
        {children}
      </div>
    </>
  )
}
