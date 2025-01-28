import Navbar from "../../Components/Navbar"
import LoginForm from "../../Components/LoginForm"
import Footer from "../../Components/Footer"
import { loginSalon } from "../../Services/salonAPI";
import {signInStart,signInSuccess,signInFailure} from '../../Redux/Salon/salonSlice'
const SalonLogin = () => {
  return (
    <div>
      <Navbar/>
      <LoginForm
        loginFunction={loginSalon} // The login function for salon login
        title="Welcome Back, Salon Log in Please!"
        redirectPath="/salon/dashboard" // Path to redirect after successful login
        signInstart={signInStart}
        signInSuccess={signInSuccess}
        signInFailure={signInFailure}
      />
      <Footer/>
    </div>
  )
}

export default SalonLogin
