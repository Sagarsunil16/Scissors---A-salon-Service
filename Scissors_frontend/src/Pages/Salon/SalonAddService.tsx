import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { useSelector } from "react-redux";
import { addService, getAllService, getStylists } from "../../Services/salonAPI";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IStylist } from "../../interfaces/interface";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Service {
  _id: string;
  name: string;
  description: string;
  service: string;
  price: number;
}

const SalonAddService = () => {
  const { salon } = useSelector((state: any) => state.salon);
  const [fetchedServices, setFetchedServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<IStylist[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [serviceData, stylistData] = await Promise.all([
          getAllService(),
          getStylists({ id: salon._id })
        ]);
        setFetchedServices(serviceData.data.services);
        setStylists(stylistData.data.result.stylists || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services and stylists");
      }
    };
    fetchServices();
  }, [salon._id]);

  const initialValues = {
    name: "",
    description: "",
    service: "",
    price: 0,
    duration: 30,
    stylists: [] as string[]
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Service name must be at least 2 characters")
      .required("Service name is required"),
    description: Yup.string()
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
    duration: Yup.number()
      .typeError("Duration must be a number")
      .positive("Duration must be positive")
      .required("Duration is required"),
  });

  const handleSubmit = async (values: any, { resetForm }: { resetForm: () => void }) => {
  try {
    const { name, description, service, price, duration, stylists } = values;

    // Construct payload
    const data: any = {
      salonId: salon._id,
      name,
      description,
      service,
      price: Number(price),
      duration: Number(duration),
    };

    // Only add stylists if it's a valid array with at least one string
    if (Array.isArray(stylists) && stylists.length > 0) {
      data.stylists = stylists;
    }

    const response = await addService(data);
    toast.success(response.data.message);
    navigate("/salon/service");
    resetForm();
  } catch (error: any) {
    console.error("Error adding service:", error);
    toast.error(error.response?.data?.message || "Failed to add service");
  }
};



  return (
    <div className="flex min-h-screen bg-gray-50">
      <SalonSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SalonHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Service</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Service Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Service Name
                        </label>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Enter service name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500 text-xs mt-1 h-4"
                        />
                      </div>

                      {/* Service Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Service Description
                        </label>
                        <Field
                          type="text"
                          id="description"
                          name="description"
                          placeholder="Enter service description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-red-500 text-xs mt-1 h-4"
                        />
                      </div>

                      {/* Services */}
                      <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                          Select Service
                        </label>
                        <Field
                          as="select"
                          id="service"
                          name="service"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a Service</option>
                          {fetchedServices.map((service) => (
                            <option key={service._id} value={service._id}>{service.name}</option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="service"
                          component="div"
                          className="text-red-500 text-xs mt-1 h-4"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹)
                        </label>
                        <Field
                          type="text"
                          id="price"
                          name="price"
                          placeholder="Enter service price"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="price"
                          component="div"
                          className="text-red-500 text-xs mt-1 h-4"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <Field
                          type="number"
                          id="duration"
                          name="duration"
                          min="15"
                          step="15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage
                          name="duration"
                          component="div"
                          className="text-red-500 text-xs mt-1 h-4"
                        />
                      </div>
                    </div>

                    {/* Stylist selection - Optional */}
                    {stylists.length > 0 && (
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Stylists (Optional)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {stylists.map((stylist) => (
                            <label
                              key={stylist._id}
                              className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                            >
                              <Field
                                type="checkbox"
                                name="stylists"
                                value={stylist._id}
                                className="h-4 w-4 text-blue-500 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm">{stylist?.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        {isSubmitting ? "Adding Service..." : "Add Service"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalonAddService;