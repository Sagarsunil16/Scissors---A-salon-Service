import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import SignIn from "../../Components/SignIn";
import { signInstart, signInFailure, signInSuccess } from "../../Redux/User/userSlice";
import { getUserDataSuccess } from "../../Redux/Admin/adminSlice";
import { loginAdmin } from "../../Services/adminAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles for toast

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values: { email: string; password: string }) => {
    dispatch(signInstart());
    try {
      const response = await loginAdmin(values);
      console.log(response);
      dispatch(signInSuccess(response.data.user));
      dispatch(getUserDataSuccess(response.data.userData));
      toast.success("Login successful!", { position: "top-right", autoClose: 3000 });
      navigate("/admin/dashboard");
    } catch (error: any) {
      dispatch(signInFailure(false));
      toast.error(error.response?.data?.error || "Failed to login. Please try again!", {
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
