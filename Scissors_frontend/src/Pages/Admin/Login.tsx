import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "@/shared/ui/organisms/navigation/Navbar";
import Footer from "@/shared/ui/organisms/navigation/Footer";
import SignIn from "@/features/auth/components/SignIn";
// import { signInstart, signInFailure, signInSuccess } from "../../Redux/User/userSlice";
import {signInStart,signInSuccess,signInFailure,getUserDataSuccess,getSalonDataSuccess } from "../../Redux/Admin/adminSlice";
import { loginAdmin } from "@/features/admin/api/adminAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles for toast

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values: { email: string; password: string }) => {
    dispatch(signInStart());
    try {
      const response = await loginAdmin(values);
      console.log(response,"login response")
      dispatch(signInSuccess(response.data.user));
      dispatch(getUserDataSuccess(response.data.userData.userData));
      dispatch(getSalonDataSuccess(response.data.salonData.salonData));
      navigate("/admin/dashboard");
      toast.success(response.data.message || "Login successful!", { position: "top-right", autoClose: 3000 });
    } catch (error: any) {
      dispatch(signInFailure(error.message));
      toast.error(error.message || "Failed to login. Please try again!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div>
      <Navbar />
      <SignIn title="Welcome Admin, Login Please!" onSubmit={handleSubmit} redirectPath="/admin/dashboard" />
      <Footer />
      <ToastContainer /> {/* Add ToastContainer here */}
    </div>
  );
};

export default Login;
