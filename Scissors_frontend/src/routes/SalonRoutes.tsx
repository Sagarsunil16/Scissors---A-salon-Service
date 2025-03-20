import { Routes,Route,Navigate } from "react-router-dom"
import PrivateRoute from "../Components/PrivateRoute"
import SalonAddService from "../Pages/Salon/SalonAddService"
import SalonService from "../Pages/Salon/SalonService"
import SalonGallery from "../Pages/Salon/SalonGallery"
import SalonProfile from "../Pages/Salon/SalonProfile"
import SalonDashboard from "../Pages/Salon/SalonDashboard"
import SalonLogin from "../Pages/Salon/SalonLogin"
import OtpVerification from "../Pages/Salon/OtpVerification"
import Registration from "../Pages/Salon/Registration"
import { useSelector } from "react-redux"
import AddStylist from "../Pages/Salon/AddStylist"
import Stylists from "../Pages/Salon/Stylists"
import EditStylist from "../Pages/Salon/EditStylist"

const SalonRoutes = () => {
    const {salon} = useSelector((state:any)=>state.salon)
  return (
    <Routes>
      <Route
          path="/register"
          element={salon ? <Navigate to="/salon/dashboard" replace /> : <Registration />}
        />

        <Route
          path="/register/otp"
          element={salon ? <Navigate to="/salon/dashboard" replace /> : <OtpVerification />}
        />

        <Route
          path="/login"
          element={salon ? <Navigate to="/salon/dashboard" replace /> : <SalonLogin />}
        />

        <Route
          path="/Dashboard"
          element={
            <PrivateRoute salonOnly={true}>
              <SalonDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute salonOnly={true}>
              <SalonProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/gallery"
          element={
            <PrivateRoute salonOnly={true}>
              <SalonGallery />
            </PrivateRoute>
          }
        />

        <Route
          path="/service"
          element={
            <PrivateRoute salonOnly={true}>
              <SalonService />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-service"
          element={
            <PrivateRoute salonOnly={true}>
              <SalonAddService />
            </PrivateRoute>
          }
        />
        <Route
          path="/stylists"
          element={
            <PrivateRoute salonOnly={true}>
              <Stylists />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-stylist"
          element={
            <PrivateRoute salonOnly={true}>
              <AddStylist />
            </PrivateRoute>
          }
        />
        <Route
          path="/stylists/edit/:id"
          element={
            <PrivateRoute salonOnly={true}>
              <EditStylist />
            </PrivateRoute>
          }
        />
    </Routes>
  )
}

export default SalonRoutes
