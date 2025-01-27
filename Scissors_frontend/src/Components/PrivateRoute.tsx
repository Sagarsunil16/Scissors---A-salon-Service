import { useSelector } from "react-redux"
import { Outlet,Navigate } from "react-router-dom"
interface PrivateRouteProps {
    adminOnly?: boolean;
    children?: React.ReactNode;
  }
const PrivateRoute = ({adminOnly,children}:PrivateRouteProps) => {
    const {currentUser} = useSelector((state:any)=>state.user)

  if(!currentUser){
    return <Navigate to={'/login'} replace/>
  }

  if(adminOnly && currentUser.role!=='Admin'){
    return <Navigate to={'/'} replace />
  }

  return children?children:<Outlet/>
}

export default PrivateRoute
