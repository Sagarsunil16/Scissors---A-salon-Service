import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AdminHeader from "../../Components/AdminHeader";
import Sidebar from "../../Components/Sidebar";
import { addService } from "../../Services/adminAPI"; // Replace with the correct API method for adding services
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
const AddNewService = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Service name is required")
     .min(3, "Service name must be at least 3 characters")
    .max(50, "Service name can't exceed 50 characters"),
    description: Yup.string()
      .required("Service description is required")
       .min(10, "Description must be at least 10 characters")
    .max(500, "Description can't exceed 500 characters"),
  });

  const handleSubmit = async (values: any) => {
    try {
      const response = await addService(values); // API call to add service
      if (response.status === 200) {
        navigate("/admin/service"); // Redirect to services list page
        toast.success(response.data.message)
      } else {
        console.error("Failed to add service");
      }
    } catch (error:any) {
      console.log("An error occurred while adding the service.", error);
      toast.error(error.response.data.message)
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        <AdminHeader />
        <h1 className="text-lg md:text-xl font-bold mb-4">Add New Service</h1>

        <Formik
          initialValues={{ name: "", description: ""}}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Service Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter service name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Service Description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  placeholder="Enter service description"
                  rows="4"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white text-sm md:text-base px-4 py-2 rounded hover:bg-blue-600 focus:ring focus:ring-blue-200 focus:outline-none"
                >
                  {isSubmitting ? "Adding..." : "Add Service"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/services")}
                  className="bg-gray-500 text-white text-sm md:text-base px-4 py-2 rounded hover:bg-gray-600 focus:ring focus:ring-gray-200 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddNewService;
