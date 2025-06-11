
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import SignIn from '../../Components/SignIn'
import { useDispatch } from 'react-redux'
import { signInstart,signInSuccess,signInFailure } from '../../Redux/User/userSlice'
import { loginUser } from '../../Services/UserAPI'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const UserLogin = () => {
  const dispatch = useDispatch()
  const handleUserLogin =  async(values:{email:string,password:string})=>{
    dispatch(signInstart())
    try {
      const response = await loginUser(values);
      dispatch(signInSuccess(response.data.user))
      console.log("Before toast success"); // Debugging
      toast.success(response.data.message)
    } catch (error:any) {
      dispatch(signInFailure(true))
      toast.error(error?.response?.data?.message || "Failed to login. Please try again!")
    }
  }
  return (
    <div>
      <Navbar/>
      <SignIn title="Welcome back. Login Please !" onSubmit={handleUserLogin}  redirectPath="/user-dashboard" />
      <Footer/>
    </div>
  )
}

export default UserLogin
