import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SignUp from './Pages/User/SignUp';
import UserLogin from './Pages/User/UserLogin';
import ForgotPassword from './Pages/User/ForgotPassword';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import PrivateRoute from './Components/PrivateRoute';
import Users from './Pages/Admin/Users';
import ForgotOtp from './Pages/User/ForgotOtp';
import ResetPass from './Pages/User/ResetPass';
import UserProfile from './Pages/User/UserProfile';
import Setting from './Pages/User/Setting';
import ChangePassword from './Pages/User/ChangePassword';
import Registration from './Pages/Salon/Registration';
import OtpVerification from './Pages/Salon/OtpVerification';
import SalonLogin from './Pages/Salon/SalonLogin';
import Login from './Pages/Admin/Login';
import SalonDashboard from './Pages/Salon/SalonDashboard';
import SalonProfile from './Pages/Salon/SalonProfile';
import OTPverification from './Pages/User/OTPverification';
import HomePage from './Pages/User/HomePage';
import Salons from './Pages/Admin/Salons';
import AdminProfile from './Pages/Admin/AdminProfile';
import AdminChangePassword from './Pages/Admin/AdminChangePassword';


export default function App() {
  const { currentUser } = useSelector((state: any) => state.user);
  const {salon} = useSelector((state:any)=>state.salon)
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={currentUser ? <Navigate to="/admin/dashboard" replace /> : <Login />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/change-password"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminChangePassword />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <PrivateRoute adminOnly={true}>
              <Users />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/salons"
          element={
            <PrivateRoute adminOnly={true}>
              <Salons />
            </PrivateRoute>
          }
        />
        {/* Add more admin routes here as needed */}
        
        {/* Salon Routes */}
        
          <Route
          path="/salon/register"
          element={salon ? <Navigate to="/salon/dashboard" replace /> : <Registration />}
        />

        <Route
          path="/salon/register/otp"
          element={salon ? <Navigate to="/salon/dashboard" replace /> : <OtpVerification />}
        />

        <Route
          path="/salon/login"
          element={salon ? <Navigate to="/salon/dashboard" replace /> : <SalonLogin />}
        />

        <Route
          path="/salon/Dashboard"
          element={
            <PrivateRoute salonOnly={true}>
              <SalonDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/salon/profile"
          element={
            <PrivateRoute salonOnly={true}>
              <SalonProfile />
            </PrivateRoute>
          }
        />
        

        {/* User Routes */}
        <Route
          path="/"
          element={currentUser ? <Navigate to="/home" replace /> : <HomePage />}
        />

        

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
      </Routes>
    </Router>
  );
}
