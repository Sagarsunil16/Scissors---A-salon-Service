
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import SignIn from '../../Components/SignIn'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { signInstart,signInSuccess,signInFailure } from '../../Redux/User/userSlice'
import { loginUser } from '../../Services/UserAPI'
const UserLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleUserLogin =  async(values:{email:string,password:string})=>{
    dispatch(signInstart())
    try {
      const response = await loginUser(values);
      dispatch(signInSuccess(response.data.user))
      alert("Login success")
      navigate("/dashboard")
    } catch (error:any) {
      dispatch(signInFailure(true))
      alert(error?.response?.data?.error || "Failed to login. Please try again!")
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
