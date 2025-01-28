import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; 
import { useNavigate } from "react-router-dom"; 
import ProfileNavbar from "./ProfileNavbar";
import { changePassword } from "../Services/UserAPI";
import { useState } from "react";
import { useSelector } from "react-redux";
const Password = () => {
  const navigate = useNavigate(); 
  const [serverMessage, setServerMessage] = useState(""); 
  const user = useSelector((state:any)=>state.user.currentUser)
  const validationSchema = Yup.object({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });
  const handleSubmit = async(values:any)=>{
    setServerMessage(""); 
        try {
         const partials = {id:user._id,currentPassword:values.currentPassword,newPassword:values.newPassword}
          const response = await changePassword(partials)
          alert("Password changes Successfully");
          navigate('/settings')
        } catch (error: any) {
          setServerMessage(
            error.response?.data?.message || "Failed to change password."
          );
        }
  }
  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center mt-20">
      <ProfileNavbar />

      <div className="bg-white shadow-lg rounded-2xl w-full max-w-3xl p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-black font-manrope">Change Password</h2>
        {serverMessage && (
          <div
            className={`text-center p-2 mb-4 rounded-lg ${
              serverMessage.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {serverMessage}
          </div>
        )}
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4">

              <div>
                <label htmlFor="currentPassword" className="block text-gray-600 font-medium mb-1">
                  Current Password
                </label>
                <Field
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="currentPassword" component="div" className="text-red-600 text-sm mt-1" />
              </div>

           
              <div>
                <label htmlFor="newPassword" className="block text-gray-600 font-medium mb-1">
                  New Password
                </label>
                <Field
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="newPassword" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-gray-600 font-medium mb-1">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
              </div>

          
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
                >
                  Change Password
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Password;
