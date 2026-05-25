import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTE_CONST } from './RouteConstant'

const ProtectedRoute = () => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to={ROUTE_CONST.LOGIN_PAGE} replace />
}

export default ProtectedRoute
