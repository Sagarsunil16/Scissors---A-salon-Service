import { useSelector } from "react-redux"
import { Outlet,Navigate } from "react-router-dom"
interface PrivateRouteProps {
    adminOnly?: boolean;
    salonOnly?:boolean
    children?: React.ReactNode;
  }
const PrivateRoute = ({adminOnly,salonOnly,children}:PrivateRouteProps) => {
    const {currentUser:adminUser} =  useSelector((state:any)=>state.admin)
    const {currentUser:normalUser} = useSelector((state:any)=>state.user)

    const currentUser = normalUser || adminUser
   

    const {salon} = useSelector((state:any)=>state.salon)

    if (salonOnly) {
      if (!salon) {
        return <Navigate to="/salon/login" replace />;
      }
      return children ? children : <Outlet />;
    }

  if(!currentUser){
    return <Navigate to={'/login'} replace/>
  }

  // Redirect admins from user routes if `adminOnly` is false
  if (!adminOnly && adminUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (adminOnly && !adminUser) {
    return <Navigate to="/" replace />;
  }

  return children?children:<Outlet/>
}

export default PrivateRoute
