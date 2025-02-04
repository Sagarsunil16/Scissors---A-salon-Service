import Navbar from "../../Components/Navbar"
import OTP from "../../Components/OTP"
import Footer from "../../Components/Footer"
import { resentOtp,verifyOtp} from "../../Services/salonAPI"
const OtpVerification = () => {
  return (
    <div>
      <Navbar/>
      <OTP resendOTP={resentOtp} verifyOTP={verifyOtp} redirectPath="/salon/login"/>
      <Footer/>
    </div>
  )
}

export default OtpVerification
