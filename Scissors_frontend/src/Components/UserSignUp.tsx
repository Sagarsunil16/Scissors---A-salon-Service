import * as Yup from 'yup'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { signUpUser,sentOTP } from '../Services/UserAPI';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { signUpStart,signUpSuccess,signUpFailure, } from '../Redux/User/userSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserSignUp = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state:any) => state.user);
  const initialValues = {
    firstname:"",
    lastname:"",
    email:"",
    phone:"",
    password:"",
    confirmPassword:""
  }
  const validationSchema = Yup.object({
    firstname:Yup.string().required("First name is required"),
    lastname:Yup.string().required("Last name is required"),
    email:Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
    phone:Yup.string()
    .matches(/^\d{10}$/,"Enter a valid 10-digit phone number")
    .required("Phone number is required"),
    password:Yup.string()
    .min(8,"Password must be at least 8 characters long")
    .matches(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])/,"Password must contain an uppercase letter, lowercase letter, number, and special character"
    )
    .required("Password is required"),
    confirmPassword:Yup.string()
    .oneOf([Yup.ref("password")],"Passwords must match")
    .required("Confirm password is required")
  })


  const navigate = useNavigate()


  

  const handleSubmit = async (values:any)=>{
    dispatch(signUpStart())
       try {
        const response =  await signUpUser(values)
        await sentOTP(values.email)
        dispatch(signUpSuccess());
        toast.success("Please verify the OTP sent to your email.");
        navigate("/signup/verify",{state:values});
       } catch (error:any) {
        const errorMessage = error?.response?.data?.message || "Sign-up failed";
        dispatch(signUpFailure(error?.response?.data?.message || "Sign-up failed"));
        toast.error(errorMessage);
       }
      }
  
 
  return (
    <div>
     
      <div className="min-h-screen flex flex-col lg:flex-row justify-center items-center py-10 relative">
        {/* Signup Form */}
        <div className="bg-white p-8 border border-gray-300 rounded-xl w-full max-w-lg m-8">
          <h2 className="text-2xl font-manrope mb-6 text-center font-semibold">
            Create an account
          </h2>

          <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          >
          {({})=>(
            <Form className='space-y-4'>
              <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label htmlFor="firstname" className="block text-gray-700 mb-2">
                      First name
                    </label>
                    <Field
                      type="text"
                      id="firstname"
                      name="firstname"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                      name="firstname"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="lastname" className="block text-gray-700 mb-2">
                      Last name
                    </label>
                    <Field
                      type="text"
                      id="lastname"
                      name="lastname"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                      name="lastname"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-gray-700 mb-2">
                    Phone
                  </label>
                  <Field
                    type="text"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400">
                We strongly recommend adding a phone number. This will help
                verify your account and keep it safe.
              </p>
                  <ErrorMessage
                    name="phone"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-gray-700 mb-2">
                    Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ul className="grid grid-cols-2 mt-2 text-xs text-gray-400">
                <li className="m-1">• Use 8 or more characters</li>
                <li className="m-1">• Use upper and lower case letters.</li>
                <li className="m-1">• Use a number (e.g. 1234)</li>
                <li className="m-1">• Use a symbol (e.g. !@#$)</li>
              </ul>
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-black text-white rounded-full hover:bg-blue-500 transition duration-500 mt-10">
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
              {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                <p className="w-full text-xs flex justify-center">
                  By creating an account, you agree to the Terms of Use and Privacy Policy.
                </p>
            </Form>
          )}
          </Formik>
          
        </div>

        {/* Right Section: Already Have an Account */}
        <div className="lg:absolute lg:right-20 lg:top-20 bg-white p-4 max-w-xs  mt-8 lg:mt-0">
          <p className="text-gray-700 mb-2">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Log in
            </a>
          </p>
          <p className="text-gray-700 mb-2">
            <a href="/login" className="text-gray-400 hover:underline">
            Forget your user ID or password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSignUp;
