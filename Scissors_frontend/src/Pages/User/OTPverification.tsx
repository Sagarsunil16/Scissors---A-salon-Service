import Navbar from '@/shared/ui/organisms/navigation/Navbar'
import { resendOTP,verifyOTP } from '@/features/user/api/UserAPI'
import OTP from '@/features/auth/components/OTP'
const OTPverification = () => {
  return (
    <div>
      <Navbar/>
      <OTP
        verifyOTP={verifyOTP}
        resendOTP={resendOTP}
        redirectPath="/login"
        fallbackPath="/signup"
        title="Verify your signup"
        description="Enter the OTP sent to your email to activate your Scissors account."
      />
    </div>
  )
}

export default OTPverification
