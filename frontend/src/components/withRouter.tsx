import { ComponentType } from 'react'
import { useLocation, useNavigate, useParams, Location, NavigateFunction } from 'react-router-dom'

/*
 * react-router 6 removed withRouter in favour of hooks. The class components in
 * this app still want router state as props, so this reimplements the HOC on
 * top of the hooks rather than converting every component to a function.
 */
export interface RouterProps<TParams = Record<string, string | undefined>> {
  location: Location
  navigate: NavigateFunction
  params: TParams
}

type OwnProps<TProps> = Omit<TProps, keyof RouterProps>

export function withRouter<TProps extends RouterProps<TParams>, TParams = Record<string, string | undefined>>(
  Wrapped: ComponentType<TProps>
): ComponentType<OwnProps<TProps>> {
  return function WithRouter(props: OwnProps<TProps>) {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams() as TParams

    const routerProps = { ...props, location, navigate, params } as unknown as TProps

    return <Wrapped {...routerProps} />
  }
}
