import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import ProfileNavbar from "./ProfileNavbar";
import * as Yup from "yup"; // For validation schema
import { updateUser } from "../Services/UserAPI";
import { updateProfileSuccess } from "../Redux/User/userSlice";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
const ProfileSetting = () => {
  const user = useSelector((state: any) => state.user.currentUser);
  const navigate = useNavigate(); // Initialize the navigate hook
  const dispatch = useDispatch()
  // Validation schema using Yup
  const validationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    phone:Yup.string()
    .matches(/^\d{10}$/,"Enter a valid 10-digit phone number")
    .required("Phone is required"),
    areaStreet: Yup.string().required("Area and street are required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    pincode: Yup.string()
      .matches(/^[0-9]{6}$/, "Invalid pin code")
      .required("Pin code is required"),
  });

  const handleUpdateUser = async (values: any) => {
    try {
      const payload = {
        id: user._id, 
        firstname: values.firstname,
        lastname: values.lastname,
        phone:values.phone,
        address: {
          areaStreet: values.areaStreet,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
      };
  
    const response:any = await updateUser(payload);
    dispatch(updateProfileSuccess(response?.data?.user))
    toast(response.data.message);
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error(error.response.data.message)
    }
  };
  

  const handleChangePasswordClick = () => {
    navigate("/change-password"); 
  };

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center mt-20">
      <ProfileNavbar />

      <div className="bg-white shadow-lg rounded-2xl w-full max-w-3xl p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-black font-manrope">Profile Settings</h2>
        <Formik
          initialValues={{
            firstname: user?.firstname || "",
            lastname: user?.lastname || "",
            phone:user?.phone,
            areaStreet: user?.address?.areaStreet || "",
            city: user?.address?.city || "",
            state: user?.address?.state || "",
            pincode: user?.address?.pincode || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            handleUpdateUser(values); 
          }}
        >
          {() => (
            <Form className="space-y-4">
              {/* Firstname Field */}
              <div>
                <label htmlFor="firstname" className="block text-gray-600 font-medium mb-1">
                  First Name
                </label>
                <Field
                  type="text"
                  id="firstname"
                  name="firstname"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="firstname" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Lastname Field */}
              <div>
                <label htmlFor="lastname" className="block text-gray-600 font-medium mb-1">
                  Last Name
                </label>
                <Field
                  type="text"
                  id="lastname"
                  name="lastname"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="lastname" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/*Phone*/}
              <div>
                <label htmlFor="phone" className="block text-gray-600 font-medium mb-1">
                  Phone
                </label>
                <Field
                  type="text"
                  id="phone"
                  name="phone"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="phone" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Address - Area and Street */}
              <div>
                <label htmlFor="areaStreet" className="block text-gray-600 font-medium mb-1">
                  Area and Street
                </label>
                <Field
                  type="text"
                  id="areaStreet"
                  name="areaStreet"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="areaStreet" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Address - City */}
              <div>
                <label htmlFor="city" className="block text-gray-600 font-medium mb-1">
                  City / District / Town
                </label>
                <Field
                  type="text"
                  id="city"
                  name="city"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="city" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Address - State */}
              <div>
                <label htmlFor="state" className="block text-gray-600 font-medium mb-1">
                  State
                </label>
                <Field
                  type="text"
                  id="state"
                  name="state"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="state" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Address - Pin Code */}
              <div>
                <label htmlFor="pincode" className="block text-gray-600 font-medium mb-1">
                  Pin Code
                </label>
                <Field
                  type="text"
                  id="pincode"
                  name="pincode"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="pincode" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
                >
                  Save Changes
                </button>
              </div>

              {/* Change Password Button */}
              {!user.googleLogin && (
                <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={handleChangePasswordClick}
                  className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  Change Password
                </button>
              </div>
              )}
              
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProfileSetting;
