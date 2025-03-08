import AdminHeader from "../../Components/AdminHeader";
import Sidebar from "../../Components/Sidebar";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { UpdateProfile } from "../../Services/adminAPI";
import { updateProfileData } from "../../Redux/Admin/adminSlice";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AdminProfile = () => {
  const dispatch = useDispatch()
  const {currentUser} = useSelector((state:any)=>state.admin)
  const validationSchema = Yup.object({
    firstname: Yup.string().required("First name is required"),
    lastname: Yup.string().required("Last name is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9-]+$/, "Phone number must contain only numbers and dashes"),
  });

  const initialValues = {
    firstname: currentUser.firstname,
    lastname: currentUser.lastname,
    phone: currentUser.phone,
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {id:currentUser._id,...values}
      const response = await UpdateProfile(data)
      toast.success(response.data.message)
      dispatch(updateProfileData(response.data.updatedAdmin))
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-6">
        <AdminHeader />
        <div className=" bg-white p-8 shadow-lg rounded-xl max-w-3xl mx-auto mt-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            Admin Profile
          </h1>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-6">
                {/* First Name Field */}
                <div className="relative">
                  <label
                    className="block text-sm font-medium text-gray-600 mb-2"
                    htmlFor="firstname"
                  >
                    First Name
                  </label>
                  <Field
                    type="text"
                    id="firstname"
                    name="firstname"
                    className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                  />
                  <ErrorMessage
                    name="firstname"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Last Name Field */}
                <div className="relative">
                  <label
                    className="block text-sm font-medium text-gray-600 mb-2"
                    htmlFor="lastname"
                  >
                    Last Name
                  </label>
                  <Field
                    type="text"
                    id="lastname"
                    name="lastname"
                    className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                  />
                  <ErrorMessage
                    name="lastname"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Phone Field */}
                <div className="relative">
                  <label
                    className="block text-sm font-medium text-gray-600 mb-2"
                    htmlFor="phone"
                  >
                    Phone
                  </label>
                  <Field
                    type="text"
                    id="phone"
                    name="phone"
                    className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                  />
                  <ErrorMessage
                    name="phone"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-lg font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  Save Changes
                </button>
              </Form>
            )}
          </Formik>
          <hr className="my-6 border-gray-300" />
          <div className="text-center">
            <Link to={'/admin/change-password'}>
            <button
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            >
              Change Password
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
