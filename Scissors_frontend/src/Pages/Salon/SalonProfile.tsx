import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { Field, Form, Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import { updateSalon } from "../../Redux/Salon/salonSlice";
import { updateSalonProfile } from "../../Services/salonAPI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SalonProfile = () => {
  const { salon } = useSelector((state: any) => state.salon);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();

  const validationSchema = Yup.object({
    salonName: Yup.string().required("Salon name is required"),
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
      .required("Phone number is required"),
    address: Yup.object({
      areaStreet: Yup.string().required("Street is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      pincode: Yup.string()
        .matches(/^\d{6}$/, "Enter a valid 6-digit pincode")
        .required("Pincode is required"),
    }),
    openingTime: Yup.string()
      .required("Opening time is required")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    closingTime: Yup.string()
      .required("Closing time is required")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
      .test("is-after-opening", "Closing time must be after opening time", function (value) {
        const { openingTime } = this.parent;
        if (!openingTime || !value) return true;
        return value > openingTime;
      }),
  });

  const initialValues = {
    id: salon._id,
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
      dispatch(updateSalon(response.data.updatedData));
      toast.success(response.data.message);
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Salon Profile
          </h1>

          {isEditing ? (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              <Form className="bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-4 w-full max-w-4xl mx-auto">
                {/* Salon Name */}
                <div>
                  <label className="block text-gray-700">Salon Name</label>
                  <Field
                    type="text"
                    name="salonName"
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  <ErrorMessage
                    name="salonName"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700">Email</label>
                  <Field
                    type="email"
                    name="email"
                    disabled
                    className="w-full px-4 py-2 border rounded-md bg-gray-100"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700">Phone</label>
                  <Field
                    type="text"
                    name="phone"
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  <ErrorMessage
                    name="phone"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Street</label>
                    <Field
                      type="text"
                      name="address.areaStreet"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage
                      name="address.areaStreet"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700">City</label>
                    <Field
                      type="text"
                      name="address.city"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage
                      name="address.city"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700">State</label>
                    <Field
                      type="text"
                      name="address.state"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage
                      name="address.state"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700">Pincode</label>
                    <Field
                      type="text"
                      name="address.pincode"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage
                      name="address.pincode"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Opening Time</label>
                    <Field
                      type="time"
                      name="openingTime"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage
                      name="openingTime"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700">Closing Time</label>
                    <Field
                      type="time"
                      name="closingTime"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <ErrorMessage
                      name="closingTime"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
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
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 lg:p-8 w-full overflow-x-auto">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">
                Salon Details
              </h2>
              <table className="min-w-full text-sm sm:text-base border border-gray-200">
                <tbody>
                  {[
                    ["Salon Name", salon.salonName],
                    ["Email", salon.email],
                    ["Phone", salon.phone],
                    ["Address", `${salon.address.areaStreet}, ${salon.address.city}, ${salon.address.state}, ${salon.address.pincode}`],
                    ["Opening Time", salon.openingTime],
                    ["Closing Time", salon.closingTime],
                    ["Verified", salon.verified ? "Yes" : "No"],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b">
                      <td className="px-4 py-3 font-semibold bg-gray-100 text-gray-700">
                        {label}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{value}</td>
                    </tr>
                  ))}
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
        </main>
      </div>
    </div>
  );
};

export default SalonProfile;
