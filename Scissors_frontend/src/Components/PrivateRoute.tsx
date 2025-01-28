import { useSelector } from "react-redux"
import { Outlet,Navigate } from "react-router-dom"
interface PrivateRouteProps {
    adminOnly?: boolean;
    salonOnly?:boolean
    children?: React.ReactNode;
  }
const PrivateRoute = ({adminOnly,salonOnly,children}:PrivateRouteProps) => {
    const {currentUser} = useSelector((state:any)=>state.user)
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

  if(adminOnly && currentUser.role!=='Admin'){
    return <Navigate to={'/'} replace />
  }

  return children?children:<Outlet/>
}

export default PrivateRoute
