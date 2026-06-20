import { resendOTP, verifyOTP } from "@/features/user/api/UserAPI";
import OTP from "./OTP";

const ForgotPasswordOTP = () => {
  return (
    <OTP
      verifyOTP={verifyOTP}
      resendOTP={resendOTP}
      redirectPath="/forgot-password/reset"
      fallbackPath="/forgot-password"
      title="Verify password reset"
      description="Enter the OTP sent to your email. After verification, you can set a new password."
      eyebrow="Password recovery"
      panelTitle="We verify the reset before allowing a password change."
      panelItems={[
        "Short-lived reset session",
        "OTP expires quickly",
        "Password update stays protected",
      ]}
      wrongEmailLabel="Use another email"
      preserveEmailOnRedirect
      verificationPurpose="password-reset"
    />
  );
};

export default ForgotPasswordOTP;
