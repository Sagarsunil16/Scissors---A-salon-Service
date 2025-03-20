import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { Field, Form, Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import { updateSalon } from "../../Redux/Salon/salonSlice";
import { updateSalonProfile } from "../../Services/salonAPI";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
const SalonProfile = () => {
  const { salon } = useSelector((state: any) => state.salon);
  const [isEditing, setIsEditing] = useState(false); // State to toggle between view and edit modes
  const dispatch = useDispatch();

  // Validation Schema
  const validationSchema = Yup.object({
    salonName: Yup.string().required("Salon name is required"),
    email: Yup.string().email("Enter a valid email address").required("Email is required"),
    phone: Yup.string().matches(/^\d{10}$/, "Enter a valid 10-digit phone number").required("Phone number is required"),
    address: Yup.object({
      areaStreet: Yup.string().required("Street is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      pincode: Yup.string().matches(/^\d{6}$/, "Enter a valid 6-digit pincode").required("Pincode is required"),
    }),
    openingTime: Yup.string().required("Opening time is required"),
    closingTime: Yup.string().required("Closing time is required"),
  });

  // Formik Initial Values
  const initialValues = {
    salonName: salon.salonName,
    email: salon.email,
    phone: salon.phone,
    address: salon.address,
    openingTime: salon.openingTime,
    closingTime: salon.closingTime,
  };

  
  const handleSubmit = async (values: any) => {
    try {
      const response = await updateSalonProfile(values); 
      console.log(response);
      dispatch(updateSalon(response.data.updatedData)); 
      toast.success(response.data.message)
      setIsEditing(false); 
    } catch (error: any) {
      console.error("Error updating salon:", error);
      toast.error(error.response.data.message)
    }
  };

  return (
    <div>
      <div className="flex">
        <SalonSidebar />
        <div className="flex-1">
          <SalonHeader />
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Salon Profile</h1>

            {/* Show either the details or the form depending on isEditing */}
            {isEditing ? (
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                <Form className="bg-white shadow-md rounded-lg p-6 space-y-4">
                  <div>
                    <label className="block text-gray-700">Salon Name</label>
                    <Field
                      type="text"
                      name="salonName"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage name="salonName" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-gray-700">Email</label>
                    <Field
                      type="email"
                      name="email"
                      disabled
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-gray-700">Phone</label>
                    <Field
                      type="text"
                      name="phone"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage name="phone" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Address Fields */}
                  <div className="space-x-4 flex">
                    <div className="w-1/2">
                      <label className="block text-gray-700">Street</label>
                      <Field
                        type="text"
                        name="address.areaStreet"
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <ErrorMessage name="address.areaStreet" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div className="w-1/2">
                      <label className="block text-gray-700">City</label>
                      <Field
                        type="text"
                        name="address.city"
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <ErrorMessage name="address.city" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>

                  <div className="space-x-4 flex">
                    <div className="w-1/2">
                      <label className="block text-gray-700">State</label>
                      <Field
                        type="text"
                        name="address.state"
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <ErrorMessage name="address.state" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div className="w-1/2">
                      <label className="block text-gray-700">Pincode</label>
                      <Field
                        type="text"
                        name="address.pincode"
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <ErrorMessage name="address.pincode" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700">Opening Time</label>
                    <Field
                      type="text"
                      name="openingTime"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage name="openingTime" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-gray-700">Closing Time</label>
                    <Field
                      type="text"
                      name="closingTime"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage name="closingTime" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </Form>
              </Formik>
            ) : (
              <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Salon Details</h2>
                <table className="w-full border-collapse border border-gray-200">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-100">Salon Name</td>
                      <td className="py-4 px-6 text-gray-600">{salon.salonName}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-100">Email</td>
                      <td className="py-4 px-6 text-gray-600">{salon.email}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-100">Phone</td>
                      <td className="py-4 px-6 text-gray-600">{salon.phone}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-100">Address</td>
                      <td className="py-4 px-6 text-gray-600">
                        {`${salon.address.areaStreet}, ${salon.address.city}, ${salon.address.state}, ${salon.address.pincode}`}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-100">Opening Time</td>
                      <td className="py-4 px-6 text-gray-600">{salon.openingTime}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-100">Closing Time</td>
                      <td className="py-4 px-6 text-gray-600">{salon.closingTime}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-100">Verified</td>
                      <td className="py-4 px-6 text-gray-600">{salon.verified ? "Yes" : "No"}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonProfile;
