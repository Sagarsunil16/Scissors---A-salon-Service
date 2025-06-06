import { useEffect, useState } from "react";
import AdminHeader from "../../Components/AdminHeader";
import Sidebar from "../../Components/Sidebar";
import { IService } from "../../interfaces/interface";
import { useNavigate } from "react-router-dom";
import {getAllServices,deleteService,editService} from "../../Services/adminAPI";
import Swal from "sweetalert2"
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AdminServices = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: ""});
  const [totalPages,setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const handleDeleteService = async (id: string) => {
    const result = await Swal.fire({
      title:"Are you Sure?",
      text:"This Action Cannot be Undone!",
      icon:"warning",
      showCancelButton:true,
      confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    })
    if(result.isConfirmed){
    try {
      const response = await deleteService({id});
      console.log(response.data);
      setServices(services.filter((service: any) => service._id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  }
  };

  const handleEditClick = (service:any) => {
    setEditingService(service._id);
    setEditForm({
      name: service.name,
      description: service.description,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSave = async (id: string) => {
    try {
      const data = { id, ...editForm };
      const response = await editService(data);
      if (response.status === 200) {
        setServices((prevServices) =>
          prevServices.map((service) =>
            service._id === id ? { ...service, ...editForm } : service
          )
        );
        setEditingService(null);
        toast.success(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setEditForm({ name: "", description: ""});
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = {page:currentPage}
        const response = await getAllServices(data);
        console.log(response)
        setServices(response.data.services);
        setTotalPages(response.data.totalPages)
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchServices();
  }, [currentPage]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        <AdminHeader />
        <h1 className="text-lg md:text-xl font-bold mb-4">Manage Services</h1>

        {/* Service List */}
        <div>
          <h2 className="text-md md:text-lg font-semibold mb-4">Service List</h2>
          {services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 md:px-4 py-2">Name</th>
                    <th className="px-2 md:px-4 py-2">Description</th>
                    <th className="px-2 md:px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service._id}>
                      <td className="border px-2 md:px-4 py-2">
                        {editingService === service._id ? (
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          service.name
                        )}
                      </td>
                      <td className="border px-2 md:px-4 py-2">
                        {editingService === service._id ? (
                          <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          service.description
                        )}
                      </td>
                      <td className="border px-2 md:px-4 py-2">
                        {editingService === service._id ? (
                          <>
                            <button
                              onClick={() => handleEditSave(service._id)}
                              className="bg-green-500 text-white text-sm px-2 py-1 rounded hover:bg-green-600 mr-2"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 text-white text-sm px-2 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <div className="gap-3">
                            <button
                              onClick={() => handleEditClick(service)}
                              className="bg-blue-500 text-white text-sm px-2 py-1 rounded hover:bg-blue-600 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteService(service._id)}
                              className="bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No services added yet.</p>
          )}
        </div>

        {/* Add New Service Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/admin/add-service")}
            className="bg-blue-500 text-white text-sm md:text-base px-4 py-2 md:px-6 md:py-2 rounded hover:bg-blue-600 focus:ring focus:ring-blue-200 focus:outline-none"
          >
            Add New Service
          </button>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-10">
            <button
              className="bg-gray-300 py-2 px-6 rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <span className="text-sm sm:text-base">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="bg-gray-300 py-2 px-6 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
      </div>
    </div>
  );
};

export default AdminServices;
