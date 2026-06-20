import Navbar from "@/shared/ui/organisms/navigation/Navbar"
import OTP from "@/features/auth/components/OTP"
import Footer from "@/shared/ui/organisms/navigation/Footer"
import { resentOtp,verifyOtp} from "@/features/salon-management/api/salonAPI"
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
