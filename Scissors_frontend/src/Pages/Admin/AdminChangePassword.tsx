import AdminHeader from "../../Components/AdminHeader";
import Sidebar from "../../Components/Sidebar";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {useSelector } from "react-redux";
import { updatePassword } from "../../Services/adminAPI";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
const AdminChangePassword = () => {
  const navigate = useNavigate()
  const { currentUser } = useSelector((state: any) => state.admin);

  const [responseMessage, setResponseMessage] = useState("");
  const [responseType, setResponseType] = useState<"success" | "error" | "">("");

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const initialValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: any,{resetForm}:any) => {
    try {
      const data = { id: currentUser._id, ...values };
      const response = await updatePassword(data);
      setResponseMessage(response.data.message);
      setResponseType("success");
      resetForm()
      // navigate('/admin/profile');
    } catch (error:any) {
      console.error("Error updating password:", error);
      setResponseMessage(
        error.response?.data?.message || "Failed to change password. Please try again."
      );
      setResponseType("error");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-6">
        <AdminHeader />
        <div className="bg-white p-8 shadow-lg rounded-xl max-w-3xl mx-auto mt-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            Change Password
          </h1>
          {/* Response Message */}
          {responseMessage && (
            <div
              className={`text-center py-2 px-4 mb-4 rounded-lg ${
                responseType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {responseMessage}
            </div>
          )}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-6">
                {/* Current Password Field */}
                <div className="relative">
                  <label
                    className="block text-sm font-medium text-gray-600 mb-2"
                    htmlFor="currentPassword"
                  >
                    Current Password
                  </label>
                  <Field
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                  />
                  <ErrorMessage
                    name="currentPassword"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* New Password Field */}
                <div className="relative">
                  <label
                    className="block text-sm font-medium text-gray-600 mb-2"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <Field
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <label
                    className="block text-sm font-medium text-gray-600 mb-2"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                  />
                  <ErrorMessage
                    name="confirmPassword"
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
            <Link to={"/admin/profile"}>
              <button
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              >
                Back to Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;
