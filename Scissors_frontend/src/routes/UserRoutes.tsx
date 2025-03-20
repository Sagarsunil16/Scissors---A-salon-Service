import { Routes,Route,Navigate } from "react-router-dom"
import ChangePassword from "../Pages/User/ChangePassword"
import PrivateRoute from "../Components/PrivateRoute"
import Setting from "../Pages/User/Setting"
import UserProfile from "../Pages/User/UserProfile"
import HomePage from "../Pages/User/HomePage"
import { useSelector } from "react-redux"
import SalonDetails from "../Pages/User/SalonDetails"
import UserLogin from "../Pages/User/UserLogin"
import SignUp from "../Pages/User/SignUp"
import OTPverification from "../Pages/User/OTPverification"
import ForgotPassword from "../Pages/User/ForgotPassword"
import ForgotOtp from "../Pages/User/ForgotOtp"
import ResetPass from "../Pages/User/ResetPass"
import Salons from "../Pages/User/Salons"
import BookingConfirmation from "../Pages/User/BookingConfirmation"


const UserRoutes = () => {
    const { currentUser } = useSelector((state: any) => state.user);
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />

      <Route path="/salons" element={<Salons />} />
      
      <Route path="/salon-details/:id" element={<SalonDetails />} />

        <Route
          path="/login"
          element={currentUser ? <Navigate to="/home" replace /> : <UserLogin />}
        />
        <Route
          path="/signup"
          element={currentUser ? <Navigate to="/home" replace /> : <SignUp />}
        />
        <Route
          path="/signup/verify"
          element={currentUser ? <Navigate to="/home" replace /> : <OTPverification />}
        />

         <Route
          path="/forgot-password"
          element={currentUser ? <Navigate to="/home" replace /> : <ForgotPassword />}
        />

        <Route
          path="/forgot-password/otp"
          element={currentUser ? <Navigate to="/home" replace /> : <ForgotOtp />}
        />

        <Route
          path="forgot-password/reset"
          element={currentUser ? <Navigate to="/home" replace /> : <ResetPass />}
        />

         
        
        {/* User's Dashboard (Protected Route) */}
        <Route
          path="/home"
          element={
            <PrivateRoute adminOnly={false}>
              <HomePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute adminOnly={false}>
              <UserProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute adminOnly={false}>
              <Setting />
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute adminOnly={false}>
              <ChangePassword />
            </PrivateRoute>
          }
        />

        <Route
          path="/salons/:salonName/book"
          element={
            <PrivateRoute adminOnly={false}>
              <BookingConfirmation />
            </PrivateRoute>
          }
        />
    </Routes>
  )
}

export default UserRoutes
