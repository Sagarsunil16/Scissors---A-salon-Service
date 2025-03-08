import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { signUpSalon, sentOtp } from "../Services/salonAPI";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SalonRegistration = () => {
  const navigate = useNavigate();
  const initialValues = {
    salonName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: {
      areaStreet: "",
      city: "",
      state: "",
      pincode: "",
    },
    category: "",
  };

  const validationSchema = Yup.object({
    salonName: Yup.string().required("Salon name is required"),
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])/,
        "Password must contain an uppercase letter, lowercase letter, number, and special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    phone: Yup.string()
      .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
      .required("Phone number is required"),
    address: Yup.object({
      areaStreet: Yup.string().required("Area/Street is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      pincode: Yup.string()
        .matches(/^\d{6}$/, "Enter a valid 6-digit pincode")
        .required("Pincode is required"),
    }),
    category: Yup.string().required("Category is required"),
  });

  const handleSubmit = async (values: any) => {
    try {
      const response = await signUpSalon(values);
      const data = { email: values.email };
      toast.success(response.data.message || "Please Verify Your Account.");
      await sentOtp(data);
      navigate("/salon/register/otp", { state: values });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to submit the form. Please try again."
      );
    }
  };

  return (
    <div>
      <div className="min-h-screen flex flex-col lg:flex-row justify-center items-center py-10 relative m-10">
        <div className="bg-white p-8 border border-gray-300 rounded-xl w-full max-w-lg m-8">
          <h2 className="text-2xl font-manrope mb-6 text-center font-semibold">
            Register Your Salon
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Salon Name */}
                <div>
                  <label
                    htmlFor="salonName"
                    className="block text-gray-700 mb-2"
                  >
                    Salon Name
                  </label>
                  <Field
                    type="text"
                    id="salonName"
                    name="salonName"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="salonName"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
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
                  <label
                    htmlFor="password"
                    className="block text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Address Fields */}
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label
                      htmlFor="address.areaStreet"
                      className="block text-gray-700 mb-2"
                    >
                      Area/Street
                    </label>
                    <Field
                      type="text"
                      id="address.areaStreet"
                      name="address.areaStreet"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                      name="address.areaStreet"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="address.city" className="block text-gray-700 mb-2">
                      City
                    </label>
                    <Field
                      type="text"
                      id="address.city"
                      name="address.city"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                      name="address.city"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label htmlFor="address.state" className="block text-gray-700 mb-2">
                      State
                    </label>
                    <Field
                      type="text"
                      id="address.state"
                      name="address.state"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                      name="address.state"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="address.pincode" className="block text-gray-700 mb-2">
                      Pincode
                    </label>
                    <Field
                      type="text"
                      id="address.pincode"
                      name="address.pincode"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                      name="address.pincode"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-gray-700 mb-2">
                    Salon Category
                  </label>
                  <Field
                    as="select"
                    id="category"
                    name="category"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex</option>
                  </Field>
                  <ErrorMessage
                    name="category"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-black text-white rounded-full hover:bg-blue-500 transition duration-500 mt-10"
                >
                  Register Salon
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SalonRegistration;
