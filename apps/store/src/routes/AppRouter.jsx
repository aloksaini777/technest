import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { routeConfig } from "./RouteConfig";
import { ROUTE_CONST } from "./RouteConstant";


const PageLoader = () => (
  <div className="flex items-center justify-center min-h-dvh">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mx-auto" />
  </div>
);

const withSuspense = (item) => item.lazy
  ? <Suspense fallback={<PageLoader />}><item.element /></Suspense>
  : <item.element />;


const AppRouter = () => (
  <div className="w-full min-h-screen bg-body font-roboto select-none">
    <Routes>
      <Route element={<PublicRoute />}>
        {routeConfig.publicRoutes.map((item) => (
          <Route 
            key={item.path}
            path={item.path}
            element={withSuspense(item)}
          />
        ))}
      </Route>

      <Route element={<ProtectedRoute />}>
        {routeConfig.protectedRoutes.map((item) => (
          <Route 
            key={item.path}
            path={item.path}
            element={withSuspense(item)}
          />
        ))}
      </Route>

      <Route path="*" element={<Navigate to={ROUTE_CONST.ORDERS_PAGE} />} />
    </Routes>
  </div>
);

export default AppRouter;
