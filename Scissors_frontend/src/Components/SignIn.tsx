import {Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserSignInProps } from "../interfaces/interface";
import { signInWithPopup } from "firebase/auth";
import { provider,auth } from "../Config/firebase";
import { googleLogin } from "../Services/UserAPI";
import { signInstart,signInSuccess,signInFailure } from "../Redux/User/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
const SignIn  = ({title,onSubmit}:UserSignInProps) => {
  const dispatch = useDispatch()
  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const signInWithGoogle =  async()=>{
    dispatch(signInstart())
    try {
      const result = await signInWithPopup(auth,provider)
      const user = result.user
      const refreshToken = user.refreshToken;
      const Idtoken = await user.getIdToken()
      const response =  await googleLogin({token:Idtoken,refreshToken:refreshToken})
      toast.success(response.data.message)
      console.log(response.data)
     dispatch(signInSuccess(response.data.user))
    } catch (error:any) {
      console.error("Error during sign-in:", error);
      dispatch(signInFailure(error.response.data.message))
      toast.error(error.response.data.message)
    }
  }
  return (
    <div>
      <div className="flex flex-col justify-center items-center min-h-screen bg-white px-4 sm:px-8 pt-16">
        <h2 className="text-3xl sm:text-4xl text-center font-poppins mb-6 sm:mb-8">
          {title}
        </h2>
        <div className="bg-white p-6 rounded-lg flex flex-col sm:flex-row w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] justify-center items-center">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4 w-full sm:w-1/2 px-4 sm:px-8">
                <div>
                  <label htmlFor="email" className="block text-gray-700">
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
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-gray-700">
                    Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-4 py-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 bg-black text-white rounded-lg hover:bg-blue-500 transition duration-500"
                >
                  Log in
                </button>
                <Link to={'/forgot-password'}>
                <div className="cursor-pointer flex justify-center hover:text-blue-500 duration-300">
                  Forgot Password?
                </div>
                </Link>
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
          <div className="w-full sm:w-1/2 px-4 sm:px-8 flex flex-col items-center">
            <button 
              id="google-signin-btn"
              type="button"
              className="flex justify-center items-center px-4 py-3 w-full border rounded-lg hover:bg-gray-200 transition duration-300"
              onClick={signInWithGoogle}
            >
              <img
                src="https://img.icons8.com/color/48/000000/google-logo.png"
                alt="Google"
                className="w-6 h-6 mr-2"
              />
              Continue with Google
            </button>
            <p className="mt-6 text-gray-500">
              No account?{" "}
              <Link to={"/signup"}>
                <span className="text-blue-500 cursor-pointer">Sign up</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
