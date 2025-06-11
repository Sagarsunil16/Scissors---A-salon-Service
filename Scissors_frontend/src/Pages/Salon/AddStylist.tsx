import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { addStylist, getSalonData } from "../../Services/salonAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Service {
  _id: string;
  name: string;
  service: {
    _id: string;
  };
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SalonAddStylist = () => {
  const { salon } = useSelector((state: any) => state.salon);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        setLoading(true);
        const id = salon._id;
        const data = await getSalonData({ id });
        const serviceData = data?.data.salonData?.services;
        if (serviceData) {
          setServices(serviceData);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchSalonData();
  }, [salon._id]);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    workingHours: [] as Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>,
    services: [] as string[],
    isAvailable: true,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Invalid phone number")
      .required("Phone is required"),
    workingHours: Yup.array()
      .of(
        Yup.object().shape({
          day: Yup.string().required("Day is required"),
          startTime: Yup.string().required("Start time is required"),
          endTime: Yup.string()
            .required("End time is required")
            .test(
              "is-after-start",
              "End time must be after start time",
              function (value) {
                const { startTime } = this.parent;
                return value > startTime;
              }
            ),
        })
      )
      .min(1, "At least one working hour entry is required")
      .max(7, "Cannot add more than 7 working hour entries"),
    services: Yup.array()
      .min(1, "Select at least one service")
      .required("Services are required"),
    isAvailable: Yup.boolean().required("Availability is required"),
  });

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const stylistData = {
        ...values,
        salon: salon._id,
      };
      await addStylist(stylistData);
      toast.success("Stylist added successfully");
      navigate("/salon/stylists");
      resetForm();
    } catch (error) {
      console.error("Error adding stylist:", error);
      toast.error("Failed to add stylist. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SalonSidebar />
        <div className="flex-1 flex flex-col">
          <SalonHeader />
          <div className="p-3 sm:p-4 flex justify-center items-center h-full">
            <div className="text-gray-600 text-xs sm:text-sm">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
            Add New Stylist
          </h2>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="max-w-full sm:max-w-xl mx-auto bg-white p-3 sm:p-4 shadow-sm rounded-lg">
                {/* Personal Information */}
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="name"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        placeholder="John Doe"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-xs mt-0.5 truncate"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="email"
                        type="email"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        placeholder="john@example.com"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-xs mt-0.5 truncate"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="phone"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        placeholder="+1234567890"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-xs mt-0.5 truncate"
                      />
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                    Working Hours
                  </h3>
                  <FieldArray name="workingHours">
                    {({ push, remove }) => (
                      <div className="space-y-2 sm:space-y-3">
                        {values.workingHours.map((_, index) => (
                          <div
                            key={index}
                            className="border border-gray-100 p-2 sm:p-2.5 rounded-md space-y-2 relative"
                          >
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="absolute top-0.5 right-0.5 text-red-500 hover:text-red-700 text-xs bg-red-50 rounded-full w-4 h-4 flex items-center justify-center"
                            >
                              ×
                            </button>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                  Day <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  as="select"
                                  name={`workingHours.${index}.day`}
                                  className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                                >
                                  <option value="">Select day</option>
                                  {daysOfWeek.map((day) => (
                                    <option key={day} value={day}>
                                      {day}
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage
                                  name={`workingHours.${index}.day`}
                                  component="div"
                                  className="text-red-500 text-xs mt-0.5 truncate"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                  Start Time <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  type="time"
                                  name={`workingHours.${index}.startTime`}
                                  className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                                />
                                <ErrorMessage
                                  name={`workingHours.${index}.startTime`}
                                  component="div"
                                  className="text-red-500 text-xs mt-0.5 truncate"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                  End Time <span className="text-red-500">*</span>
                                </label>
                                <Field
                                  type="time"
                                  name={`workingHours.${index}.endTime`}
                                  className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                                />
                                <ErrorMessage
                                  name={`workingHours.${index}.endTime`}
                                  component="div"
                                  className="text-red-500 text-xs mt-0.5 truncate"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            if (values.workingHours.length >= 7) {
                              toast.error("Cannot add more than 7 working hour entries");
                              return;
                            }
                            push({ day: "", startTime: "", endTime: "" });
                          }}
                          className="w-full py-1 text-blue-500 hover:text-blue-700 border border-dashed border-blue-100 rounded-md text-xs"
                        >
                          + Add Working Hours
                        </button>
                      </div>
                    )}
                  </FieldArray>
                  {values.workingHours.length === 0 && (
                    <div className="text-red-500 text-xs mt-0.5">
                      At least one working hour entry is required
                    </div>
                  )}
                </div>

                {/* Services */}
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                    Services
                  </h3>
                  {services.length === 0 ? (
                    <div className="text-gray-600 text-xs">
                      No services available. Please add services first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                      {services.map((service) => (
                        <label
                          key={service._id}
                          className="flex items-center space-x-1 p-1.5 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <Field
                            type="checkbox"
                            name="services"
                            value={service.service._id}
                            className="h-3 w-3 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <ErrorMessage
                    name="services"
                    component="div"
                    className="text-red-500 text-xs mt-0.5 truncate"
                  />
                </div>

                {/* Availability */}
                <div className="mb-3 sm:mb-4">
                  <label className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
                    <div className="relative">
                      <Field
                        type="checkbox"
                        name="isAvailable"
                        className="sr-only"
                      />
                      <div
                        className={`w-7 h-4 sm:w-8 sm:h-5 rounded-full transition-colors ${
                          values.isAvailable ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${
                            values.isAvailable ? "translate-x-3 sm:translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Available for appointments
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate("/salon/stylists")}
                    className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-colors text-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "Adding..." : "Add Stylist"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SalonAddStylist;