import { useSelector } from "react-redux"
import { Outlet,Navigate, useLocation } from "react-router-dom"
import { RootState } from "@/Redux/store";

interface PrivateRouteProps {
    adminOnly?: boolean;
    salonOnly?:boolean
    children?: React.ReactNode;
  }
const PrivateRoute = ({adminOnly,salonOnly,children}:PrivateRouteProps) => {
    const location = useLocation();
    const adminUser = useSelector((state: RootState) => state.admin.currentUser)
    const normalUser = useSelector((state: RootState) => state.user.currentUser)
    const salon = useSelector((state: RootState) => state.salon.salon)

    if (salonOnly) {
      if (!salon) {
        return <Navigate to="/salon/login" replace />;
      }
      return children ? children : <Outlet />;
    }

  if (adminOnly && !adminUser) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly) {
    return children ? children : <Outlet />;
  }

  if (!normalUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children?children:<Outlet/>
}

export default PrivateRoute
