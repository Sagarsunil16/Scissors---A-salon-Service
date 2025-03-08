
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { useDispatch, useSelector } from "react-redux";
import { addService, getAllService } from "../../Services/salonAPI";
import { useEffect, useState } from "react";
// import { addNewService } from "../../Redux/Salon/salonSlice";
import { useNavigate } from "react-router-dom";
interface Service {
  _id: string;
  name: string;
  description: string;
  service: string;
  price: number;
}
const SalonAddService = () => {
  const {salon} = useSelector((state:any)=>state.salon)
  const [fetchedServices, setFetchedServices] = useState<Service[]>([]);
  // const dispatch = useDispatch()
  const navigate = useNavigate()

    useEffect(() => {
      const fetchServices = async () => {
        try {
          const serviceData = await getAllService();
          setFetchedServices(serviceData.data.services);
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      };
      fetchServices();
    }, []);

  const initialValues = {
    serviceName: "",
    serviceDescription: "",
    service: "",
    price: "",
    duration:30,
    stylists:[] as string[]
  };

  const stylists = [
    { _id: "1", name: "John Doe" },
    { _id: "2", name: "Jane Smith" },
    { _id: "3", name: "Michael Brown" },
    { _id: "4", name: "Emily Johnson" },
  ];
  

  // Validation schema using Yup
  const validationSchema = Yup.object({
    serviceName: Yup.string()
      .min(2, "Service name must be at least 2 characters")
      .required("Service name is required"),
    serviceDescription: Yup.string()
      .min(5, "Description must be at least 5 characters")
      .required("Service description is required"),
      service: Yup.string()
      .required("Service selection is required")
      .test(
        'not-default',
        'Please select a valid service',
        value => value !== "" && value !== undefined
      ),
    price: Yup.number()
      .typeError("Price must be a number")
      .positive("Price must be a positive number")
      .required("Price is required"),
    duration:Yup.number()
    .typeError("Duration must be a number")
    .positive("Duration must be positive")
    .required("Duraion is required"),
    stylist:Yup.array()
    .min(1,"Select at least one stylist")
    .required("At least one stylist is required"),
  });

  // Form submission
  const handleSubmit = async (values:any, { resetForm }) => {
    try {
      const data  = {id:salon._id,...values}
    const response = await addService(data)
    console.log(response)
      // dispatch(addNewService(response.data.updatedSalonData))
      navigate('/salon/service')
      resetForm();
    } catch (error) {
      console.error("Error adding service:", error);
      alert("Failed to add service. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SalonSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <SalonHeader />

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Add New Service</h2>

          {/* Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg">
                {/* Service Name */}
                <div className="mb-4">
                  <label htmlFor="serviceName" className="block font-medium mb-1">
                    Service Name
                  </label>
                  <Field
                    type="text"
                    id="serviceName"
                    name="serviceName"
                    placeholder="Enter service name"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  />
                  <ErrorMessage
                    name="serviceName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Service Description */}
                <div className="mb-4">
                  <label htmlFor="serviceDescription" className="block font-medium mb-1">
                    Service Description
                  </label>
                  <Field
                    type="text"
                    id="serviceDescription"
                    name="serviceDescription"
                    placeholder="Enter service description"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  />
                  <ErrorMessage
                    name="serviceDescription"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Services */}
                <div className="mb-4">
                  <label htmlFor="service" className="block font-medium mb-1">
                    Select Service
                  </label>
                  <Field
                    as="select"
                    id="service"
                    name="service"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    <option value="">Select a Service</option>
                    {fetchedServices.map((service)=>(
                      <option key={service._id} value={service._id}>{service.name}</option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="service"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Price */}
                <div className="mb-4">
                  <label htmlFor="price" className="block font-medium mb-1">
                    Price
                  </label>
                  <Field
                    type="text"
                    id="price"
                    name="price"
                    placeholder="Enter service price"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label htmlFor="duration" className="block font-medium mb-1">
                    Duration
                  </label>
                  <Field
                    type="number"
                    id="duration"
                    name="duration"
                    min="15"
                    step="15"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  />
                  <ErrorMessage
                    name="duration"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Stylist selection */}
                <div className="mb-4">
                  <label htmlFor="Stylist" className="block font-medium mb-1">
                    Available Stylists
                  </label>
                  <div role="group" className="grid grid-cols-2 gap-2">
                    {stylists?.map((stylist) => (
                      <label
                        key={stylist._id}
                        className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                      >
                        <Field
                          type="checkbox"
                          name="stylists"
                          value={stylist._id}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <span>{stylist.name}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage
                    name="stylists"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    {isSubmitting ? "Adding..." : "Add Service"}
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

export default SalonAddService;
