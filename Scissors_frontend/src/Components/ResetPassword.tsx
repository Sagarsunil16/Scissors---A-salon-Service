import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../Services/UserAPI";
import * as Yup from "yup";

const ResetPassword = () => {
  const [serverError, setServerError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    password: Yup.string() // Fixed typo here
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])/,
        "Password must contain an uppercase letter, lowercase letter, number, and special character"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match") // Added error message
      .required("Confirm password is required"),
  });

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (values: { password: string }) => {
    setServerError("");
    try {
      const response = await resetPassword({
        email,
        password: values.password,
      });
      alert("Password changed successfully! Please log in.");
      navigate("/");
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "Failed to reset password. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h1 className="text-3xl sm:text-4xl text-center font-poppins mb-6 sm:mb-8">
          Reset Password
        </h1>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  New Password
                </label>
                <Field
                  id="password" // Fixed typo here
                  name="password"
                  type="password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              {serverError && (
                <p className="text-red-500 text-sm mt-1">{serverError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2 bg-black text-white rounded-lg hover:bg-blue-500 transition duration-500"
              >
                Reset Password
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ResetPassword;
