import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTE_CONST } from './RouteConstant'

const PublicRoute = () => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    return !isAuthenticated ? <Outlet /> : <Navigate to={ROUTE_CONST.ORDERS_PAGE} replace />
}

export default PublicRoute
