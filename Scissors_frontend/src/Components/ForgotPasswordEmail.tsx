
import {useNavigate } from "react-router-dom"
import { forgotPassword } from "../Services/UserAPI"
import * as Yup from "yup"
import { useState } from "react"
import { Field, Formik,Form, ErrorMessage } from "formik"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
const ForgotPasswordEmail = () => {
    const navigate = useNavigate()
    const [serverError,setServerError] = useState("")
    const initialValues = {
    email:""
    }
    const validationSchema = Yup.object({
        email:Yup.string()
        .email("Enter a valid email address")
        .required("Email is required")
    })

    const handleSubmit = async(values:{email:string})=>{
        setServerError("");
        try {
            const response = await forgotPassword(values)
            console.log(response)
            toast.success(response.data.message || 'OTP send Successfully to your email')
            navigate(`/forgot-password/otp`, { state: { email: values.email } });
        } catch (error:any) {
            setServerError(error.response?.data?.message || "Failed to send OTP. Try again.");
            toast.error(error.response.data.message)
        }
    }
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-4 sm:px-8 pt-16">
      <h2 className="text-3xl sm:text-4xl text-center font-poppins mb-6 sm:mb-8">
        Forgot your password?
      </h2>
      <div className="bg-white p-6 rounded-lg flex flex-col sm:flex-row w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] justify-center items-center">
        {/* Left Section */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4 w-full sm:w-1/2 px-4 sm:px-8">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="email"
                  component={"p"}
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
              <button
                type="submit"
                className="w-full py-4 mt-4 bg-black text-white rounded-lg hover:bg-blue-500 transition duration-500"
              >
                Send OTP
              </button>
            </Form>
          )}
        </Formik>

        {/* OR Divider */}
        <div className="hidden sm:flex flex-col items-center mx-6">
          <div className="h-full w-[1px] bg-gray-900"></div>
          <p className="text-gray-500 font-medium my-2">OR</p>
          <div className="h-full w-[1px] bg-gray-900"></div>
        </div>

        {/* Right Section */}
        <div className="w-full sm:w-1/2 px-4 sm:px-8 flex flex-col items-center mt-4">
          <button
            type="button"
            className="flex justify-center items-center px-4 py-3 w-full border rounded-lg hover:bg-gray-200 transition duration-300"
          >
            <img
              src="https://img.icons8.com/color/48/000000/google-logo.png"
              alt="Google"
              className="w-6 h-6 mr-2"
            />
            Continue with Google
          </button>
          <p className="mt-6 text-gray-500">
            Remembered your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-500 cursor-pointer"
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordEmail
