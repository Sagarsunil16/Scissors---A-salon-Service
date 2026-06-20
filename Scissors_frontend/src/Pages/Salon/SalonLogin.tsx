import Navbar from "@/shared/ui/organisms/navigation/Navbar"
import LoginForm from "@/features/auth/components/LoginForm"
import Footer from "@/shared/ui/organisms/navigation/Footer"
import { loginSalon } from "@/features/salon-management/api/salonAPI";
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
