
import { useNavigate,Link } from "react-router-dom";
import { signInstart,signInSuccess,signInFailure } from "../Redux/User/userSlice";
import { getUserDataSuccess } from "../Redux/Admin/adminSlice";
import { useDispatch } from "react-redux";
import { loginAdmin } from "../Services/adminAPI";
import * as Yup from 'yup'
import { ErrorMessage, Field, Form, Formik } from "formik";


const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues = {
    email:"",
    password:""
  }

  const validationSchema = Yup.object({
    email:Yup.string()
      .email('Enter a valid email address')
      .required("Email is required"),
    password:Yup.string().required('Password is required')
  });
    const handleSubmit = async (values:{email:string,password:string})=>{
        dispatch(signInstart())
        try {
          const response = await loginAdmin(values)
          alert("Login Successfull")
          dispatch(signInSuccess(response.data.user))
          dispatch(getUserDataSuccess(response.data.userData))
          navigate('/admin/dashboard')
        } catch (error:any) {
          console.log(error)
          dispatch(signInFailure(false))
          alert(error?.response?.data?.message || "Failed to login. Please try again!")
        }
      }
    

  return (
    <div>
      <div className="flex flex-col justify-center items-center min-h-screen bg-white px-4 sm:px-8 pt-16">
        <h2 className="text-3xl sm:text-4xl text-center font-poppins mb-6  sm:mb-8">
          Hello Admin, Log in Please!
        </h2>
        <div className="bg-white p-6 rounded-lg flex flex-col sm:flex-row w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] justify-center items-center">
          {/* Left Section */}
          <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          >
            {({isSubmitting})=>(
              <Form className="space-y-4 w-full sm:w-1/2 px-4 sm:px-8">
                <div>
                <label htmlFor="email" className="block text-gray-700">
                  Email Address
                </label>
                 <Field
                 id="email"
                 name="email"
                 type = "email"
                 className="w-full px-4 py-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 <ErrorMessage
                 name="email"
                 component={'p'}
                 className="text-red-500 text-xs mt-1"
                 />
                </div>
                <div>
                  <label htmlFor="password" className="block text-gray-700">
                    Password
                  </label>
                  <Field
                    type='password'
                    name='password'
                    id='password'
                    className="w-full px-4 py-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                    name="password"
                    component={'p'}
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
              No account?{" "}
              <Link to={'/signup'}  >
              <span className="text-blue-500 cursor-pointer">Sign up</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
