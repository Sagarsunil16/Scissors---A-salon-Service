import { useEffect, useState } from "react"
import * as Yup from 'yup'
import { Formik,Form,Field,ErrorMessage } from "formik"
import { useLocation, useNavigate } from "react-router-dom"
import { resendOTP,verifyOTP } from "../Services/UserAPI"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
const ForgotPasswordOTP = () => {

    const [serverError,setServerError] = useState('');
    const [timer,setTimer] = useState(60)
    const [isResendEnabled,setIsResendEnabled] = useState(false)
    const location = useLocation()
    const email = location.state?.email
    console.log("email",email)
    const navigate = useNavigate()
    useEffect(()=>{
        if(!email){
            navigate('/forgot-password')
        }
    },[email,navigate])

    useEffect(()=>{
        let interval:number | undefined
        if(timer>0){
            interval = window.setInterval(()=>{
                setTimer((prev)=>prev-1)
            },1000)
        }else{
            setIsResendEnabled(true);
            clearInterval(interval)
        }
        return () => clearInterval(interval); // Cleanup on unmount
    },[timer])

    const initialValues = {
        otp:""
    }
    const validationSchema = Yup.object(
        {
            otp:Yup.string()
            .required("OTP is required")
            .length(6,"OTP must be 6 digits")
        }
    )

    const resend = async()=>{
        setServerError("")
        try {
            const response = await resendOTP(email)
            toast(response.data.message || "Otp resended")
            setTimer(60);
            setIsResendEnabled(false);
        } catch (error:any) {
            setServerError(error.message)
            toast.error(error.response.data.message)
        }
    }

    const handleSubmit = async(values:{otp:string})=>{
        setServerError("")
        try {
            const response = await verifyOTP({email,otp:values.otp})
            toast.success(response.data.message)
            navigate('/forgot-password/reset',{state:{email}})
        } catch (error:any) {
            setServerError(error.message)
            toast.error(error.response.data.message)
        }
    }
  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
      <h2 className="text-3xl sm:text-4xl text-center font-poppins mb-6 sm:mb-8">Verify OTP</h2>
        <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        >
        {()=>(
            
            <Form className="space-y-4">
                <div>
                <label htmlFor="otp" className="block text-gray-700 mb-2">
                  OTP
                </label>
                <Field
                id="otp"
                name="otp"
                type="text"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="otp"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
                </div>
                {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
                <button
                type="submit"
                className="w-full py-2 bg-black text-white rounded-lg hover:bg-blue-500 transition duration-500"
              >
                Verify OTP
              </button>
              <div className="text-center mt-4">
                <p>
                  Didn't receive the code?{" "}
                  {isResendEnabled ? (
                    <button
                      type="button"
                      onClick={resend}
                      className="text-blue-500 hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-gray-500">Resend in {timer}s</span>
                  )}
                </p>
              </div>
            </Form>
        )}
        </Formik>
      </div>
    </div>
  )
}

export default ForgotPasswordOTP
