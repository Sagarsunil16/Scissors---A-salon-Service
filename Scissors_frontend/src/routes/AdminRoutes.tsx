import { Routes,Route,Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PrivateRoute from "../Components/PrivateRoute";
import Salons from "../Pages/Admin/Salons";
import Users from "../Pages/Admin/Users";
import AdminChangePassword from "../Pages/Admin/AdminChangePassword";
import AdminProfile from "../Pages/Admin/AdminProfile";
import AddNewService from "../Pages/Admin/AddNewService";
import AdminServices from "../Pages/Admin/AdminServices";
import AddCategory from "../Pages/Admin/AddNewCategory";
import AdminCategory from "../Pages/Admin/AdminCategory";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import Login from "../Pages/Admin/Login";

const AdminRoutes = () => {
    const {currentUser:adminUser} = useSelector((state:any)=>state.admin)
  return (
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/login"
          element={adminUser ? <Navigate to="/admin/dashboard" replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/category"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminCategory />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-category"
          element={
            <PrivateRoute adminOnly={true}>
              <AddCategory />
            </PrivateRoute>
          }
        />

        <Route
          path="/service"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminServices />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-service"
          element={
            <PrivateRoute adminOnly={true}>
              <AddNewService />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminChangePassword />
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute adminOnly={true}>
              <Users />
            </PrivateRoute>
          }
        />

        <Route
          path="/salons"
          element={
            <PrivateRoute adminOnly={true}>
              <Salons />
            </PrivateRoute>
          }
        />
    </Routes>
  )
}

export default AdminRoutes
