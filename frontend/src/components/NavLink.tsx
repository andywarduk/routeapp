import { Link, LinkProps } from 'react-router-dom'

// Component

export default function NavLink(props: LinkProps) {
  return <Link className='nav-link' {...props}/>
}
