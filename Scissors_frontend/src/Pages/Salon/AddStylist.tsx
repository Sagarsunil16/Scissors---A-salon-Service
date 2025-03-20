import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { addStylist, getSalonData } from "../../Services/salonAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
interface Service {
  _id: string;
  name: string;
  service: {
    _id:string
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const id = salon._id;
        const data = await getSalonData({ id });
        const serviceData = data?.data.salonData?.services
        console.log(serviceData,"serviceDta")
        if (data?.data.salonData.services) {  
          setServices(serviceData);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSalonData()
  }, []);

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
      .min(1, "At least one working hour entry is required"),
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
      navigate("/salon/stylists");
      resetForm();
    } catch (error) {
      console.error("Error adding stylist:", error);
      toast.error("Failed to add stylist. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Add New Stylist</h2>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="max-w-2xl mx-auto bg-white p-6 shadow-lg rounded-lg">
                {/* Personal Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">Name</label>
                      <Field
                        name="name"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Email</label>
                      <Field
                        name="email"
                        type="email"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Phone</label>
                      <Field
                        name="phone"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Working Hours</h3>
                  <FieldArray name="workingHours">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        {values.workingHours.map((workingHour, index) => (
                          <div
                            key={index}
                            className="border p-4 rounded-lg space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Shift {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm mb-1">
                                  Day
                                </label>
                                <Field
                                  as="select"
                                  name={`workingHours.${index}.day`}
                                  className="w-full px-2 py-1 border rounded"
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
                                  className="text-red-500 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">
                                  Start Time
                                </label>
                                <Field
                                  type="time"
                                  name={`workingHours.${index}.startTime`}
                                  className="w-full px-2 py-1 border rounded"
                                />
                                <ErrorMessage
                                  name={`workingHours.${index}.startTime`}
                                  component="div"
                                  className="text-red-500 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">
                                  End Time
                                </label>
                                <Field
                                  type="time"
                                  name={`workingHours.${index}.endTime`}
                                  className="w-full px-2 py-1 border rounded"
                                />
                                <ErrorMessage
                                  name={`workingHours.${index}.endTime`}
                                  component="div"
                                  className="text-red-500 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            push({ day: "", startTime: "", endTime: "" })
                          }
                          className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200"
                        >
                          Add Working Hours
                        </button>
                      </div>
                    )}
                  </FieldArray>
                  {values.workingHours.length === 0 && (
                    <div className="text-red-500 text-sm mt-1">
                      At least one working hour entry is required
                    </div>
                  )}
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Services</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((service) => (
                      <label
                        key={service._id}
                        className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                      >
                        <Field
                          type="checkbox"
                          name="services"
                          value={service.service._id}
                          className="form-checkbox h-4 w-4"
                        />
                        <span>{service.name}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage
                    name="services"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <label className="flex items-center space-x-2">
                    <Field
                      type="checkbox"
                      name="isAvailable"
                      className="form-checkbox h-4 w-4"
                    />
                    <span className="font-medium">Currently Available</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                  {isSubmitting ? "Adding..." : "Add Stylist"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SalonAddStylist;
