import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import { resendOTP,verifyOTP } from '../../Services/UserAPI'
import OTP from '../../Components/OTP'
const OTPverification = () => {
  return (
    <div>
      <Navbar/>
      <OTP verifyOTP={verifyOTP} resendOTP={resendOTP} redirectPath='/login' />
      <Footer/>
    </div>
  )
}

export default OTPverification
