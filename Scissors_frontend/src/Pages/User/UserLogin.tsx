
import Navbar from '@/shared/ui/organisms/navigation/Navbar'
import Footer from '@/shared/ui/organisms/navigation/Footer'
import SignIn from '@/features/auth/components/SignIn'
import { useDispatch } from 'react-redux'
import { signInstart,signInSuccess,signInFailure } from '../../Redux/User/userSlice'
import { loginUser } from '@/features/user/api/UserAPI'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

const UserLogin = () => {
  const dispatch = useDispatch()
  const handleUserLogin =  async(values:{email:string,password:string})=>{
    dispatch(signInstart())
    try {
      const response = await loginUser(values);
      dispatch(signInSuccess(response.data.user))
      toast.success(response.data.message)
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error
        : null;
      dispatch(signInFailure(message || "Login failed"))
      toast.error(message || "Failed to login. Please try again!")
      throw error
    }
  }
  return (
    <div>
      <Navbar/>
      <SignIn title="Welcome back" onSubmit={handleUserLogin} redirectPath="/home" />
      <Footer/>
    </div>
  )
}

export default UserLogin
