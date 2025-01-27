import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from './Pages/Admin/Login';
import SignUp from './Pages/User/SignUp';
import UserLogin from './Pages/User/UserLogin';
import ForgotPassword from './Pages/User/ForgotPassword';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import UserDashboard from './Pages/User/UserDashboard';
import PrivateRoute from './Components/PrivateRoute';
import Users from './Pages/Admin/Users';
import ForgotOtp from './Pages/User/ForgotOtp';
import ResetPass from './Pages/User/ResetPass';
import UserProfile from './Pages/User/UserProfile';
import Setting from './Pages/User/Setting';
import ChangePassword from './Pages/User/ChangePassword';
import Registration from './Pages/Salon/Registration';
import OtpVerification from './Pages/Salon/OtpVerification';

export default function App() {
  const { currentUser } = useSelector((state: any) => state.user);

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
          path="/admin/users"
          element={
            <PrivateRoute adminOnly={true}>
              <Users />
            </PrivateRoute>
          }
        />
        {/* Add more admin routes here as needed */}
        
        {/* Salon Routes */}
        
          <Route
          path="/salon/register"
          element={currentUser ? <Navigate to="/salon/dashboard" replace /> : <Registration />}
        />

        <Route
          path="/salon/register/otp"
          element={currentUser ? <Navigate to="/salon/dashboard" replace /> : <OtpVerification />}
        />

        {/* User Routes */}
        <Route
          path="/"
          element={currentUser ? <Navigate to="/home" replace /> : <UserLogin />}
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
              <UserDashboard />
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
