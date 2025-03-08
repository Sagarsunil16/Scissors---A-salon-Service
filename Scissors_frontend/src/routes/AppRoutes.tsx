import AdminRoutes from "./AdminRoutes"
import SalonRoutes from "./SalonRoutes"
import UserRoutes from "./UserRoutes"
import { Routes,Route } from "react-router-dom"
const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/admin/*" element={<AdminRoutes />}/>
        <Route path="/salon/*" element={<SalonRoutes />}/>
        <Route path="/*" element={<UserRoutes />}/>
    </Routes>
  )
}

export default AppRoutes
