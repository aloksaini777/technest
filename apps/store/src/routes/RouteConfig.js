import { lazy } from 'react';
import { ROUTE_CONST } from './RouteConstant';
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const Orders = lazy(() => import('../pages/Orders'));



const run = (importFn) => {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => importFn(), { timeout: 3000 });
    } else {
        setTimeout(() => importFn(), 3000);
    }
};

export const prefetchUserRoutes = () => {
    run(() => import('../pages/Auth/Login'));
    run(() => import('../pages/Auth/Register'));
    run(() => import('../pages/Orders'));
};


export const prefetchAdminRoutes = () => {
    run(() => import('../pages/Auth/Login'));
    run(() => import('../pages/Auth/Register'));
};


export const routeConfig = {
    protectedRoutes: [
        { path: ROUTE_CONST.ORDERS_PAGE, element: Orders, lazy: true },
    ],
    publicRoutes: [
        { path: ROUTE_CONST.LOGIN_PAGE, element: Login, lazy: true },
        { path: ROUTE_CONST.REGISTER_PAGE, element: Register, lazy: true },
    ],
};
