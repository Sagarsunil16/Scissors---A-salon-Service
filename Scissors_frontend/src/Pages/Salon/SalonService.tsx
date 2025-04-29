import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { useSelector } from "react-redux";
import {
  getAllService,
  addService,
  getSalonData,
  updateService,
  deleteService,
  getStylists,
} from "../../Services/salonAPI";
import { IStylist } from "../../interfaces/interface";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";

interface Service {
  _id: string;
  name: string;
  description: string;
  service: {
    name: string;
    _id: string;
  };
  price: number;
  duration: number;
  stylists: [{ _id: string }];
}

const SalonService = () => {
  const { salon } = useSelector((state: any) => state.salon);

  const [fetchedServices, setFetchedServices] = useState<Service[]>([]);
  const [salonServices, setSalonServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<IStylist[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    service: "",
    duration: 30,
    stylists: [] as string[],
  });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(true);


  const fetchServices = async () => {
      try {
        setLoading(true);
        const serviceData = await getAllService();
        setFetchedServices(serviceData.data.services);
        const data = {
          id: salon._id,
          search: searchQuery,
          page: currentPage,
          limit: itemsPerPage,
        };
        const salonData = await getSalonData(data);
        setSalonServices(salonData.data.salonData.services);
        setTotalServices(salonData.data.salonData.total || salonData.data.salonData.services.length);
        const stylistData = await getStylists({ id: salon._id });
        setStylists(stylistData.data.result.stylists);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to fetch services");
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    
    fetchServices();
  }, [salon._id, editingService, searchQuery, currentPage]);

  const handleSubmit = async (values: any) => {
    try {
      const data = { id: salon._id, ...values };
      const response = await addService(data);
      setSalonServices(response.data.updatedSalonData.services);
      toast.success("Service added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add service");
    }
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service._id);
    setEditForm({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      service: service.service._id,
      duration: service.duration,
      stylists: service.stylists.map((stylist) => stylist._id),
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setEditForm((prev) => ({ ...prev, duration: value }));
  };

  const handleStylistChange = (stylistId: string) => {
    setEditForm((prev) => ({
      ...prev,
      stylists: prev.stylists.includes(stylistId)
        ? prev.stylists.filter((id) => id !== stylistId)
        : [...prev.stylists, stylistId],
    }));
  };

  const handleEditCancel = () => {
    setEditingService(null);
    setEditForm({
      name: "",
      description: "",
      price: "",
      service: "",
      duration: 30,
      stylists: [],
    });
  };

  const handleEditSave = async (id: string) => {
    try {
      const salonId = salon._id;
      const serviceId = id;
      const data = { salonId, serviceId, ...editForm };
      const response = await updateService(data);
      const updatedService = response.data.result;

      setSalonServices((prevServices) =>
        prevServices.map((service) =>
          service._id === serviceId
            ? { ...service, ...updatedService }
            : service
        )
      );
      toast.success(response.data.message);
      setEditingService(null);
      setEditForm({
        name: "",
        description: "",
        price: "",
        service: "",
        duration: 30,
        stylists: [],
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update service");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleDeleteService = async (serviceId: string) => {
    const result = await Swal.fire({
      title: "Are you Sure?",
      text: "This Action Cannot be Undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        const salonId = salon._id;
        const data = { salonId, serviceId };
        const response = await deleteService(data);
        toast.success(response.data.message);
        setSalonServices((prevServices) =>
          prevServices.filter((service) => service._id !== serviceId)
        );
        setTotalServices((prev) => prev - 1);
        if (salonServices.length <= 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete service");
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const totalPages = Math.ceil(totalServices / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalServices);

  return (
    <div className="flex flex-col min-h-screen bg-white md:flex-row">
      <SalonSidebar />
      <div className="flex-1 flex flex-col w-full">
        <SalonHeader />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-semibold">Salon Services</h2>
            <Link to={"/salon/add-service"}>
              <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600">
                Add Service
              </Button>
            </Link>
          </div>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full sm:w-64 text-sm"
            />
          </div>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : salonServices.length === 0 ? (
            <div className="text-center py-4">No services found</div>
          ) : (
            <>
              <div className="text-xs sm:text-sm text-gray-600 mb-2">
                Showing {startIndex}-{endIndex} of {totalServices} services
              </div>
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[100px]">
                        Name
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[150px]">
                        Description
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[100px]">
                        Service
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[80px]">
                        Price
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[80px]">
                        Duration
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">
                        Stylists
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salonServices.map((service, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          {editingService === service._id ? (
                            <input
                              type="text"
                              name="name"
                              value={editForm.name}
                              className="border rounded px-2 py-1 w-full text-xs sm:text-sm"
                              onChange={handleInputChange}
                            />
                          ) : (
                            service.name
                          )}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          {editingService === service._id ? (
                            <input
                              type="text"
                              name="description"
                              value={editForm.description}
                              className="border rounded px-2 py-1 w-full text-xs sm:text-sm"
                              onChange={handleInputChange}
                            />
                          ) : (
                            service.description
                          )}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          {editingService === service._id ? (
                            <select
                              name="service"
                              value={editForm.service}
                              className="border rounded px-2 py-1 w-full text-xs sm:text-sm"
                              onChange={handleInputChange}
                            >
                              <option value="">Select a Service</option>
                              {fetchedServices.map((srv) => (
                                <option key={srv._id} value={srv._id}>
                                  {srv.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            service.service.name
                          )}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          {editingService === service._id ? (
                            <input
                              type="text"
                              name="price"
                              value={editForm.price}
                              className="border rounded px-2 py-1 w-full text-xs sm:text-sm"
                              onChange={handleInputChange}
                            />
                          ) : (
                            `Rs ${service.price}`
                          )}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          {editingService === service._id ? (
                            <input
                              type="number"
                              min="15"
                              step="15"
                              value={editForm.duration}
                              className="border rounded px-2 py-1 w-full text-xs sm:text-sm"
                              onChange={handleDurationChange}
                            />
                          ) : (
                            `${service.duration} mins`
                          )}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          {editingService === service._id ? (
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {stylists.map((stylist) => (
                                <label
                                  key={stylist._id}
                                  className="flex items-center space-x-2 text-xs sm:text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editForm.stylists.includes(stylist._id)}
                                    onChange={() => handleStylistChange(stylist._id)}
                                    className="h-4 w-4 text-blue-500"
                                  />
                                  <span>{stylist.name}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            service.stylists
                              .map((stylist) =>
                                stylists.find((s) => s._id === stylist._id)?.name
                              )
                              .filter(Boolean)
                              .join(", ")
                          )}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 align-middle">
                          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            {editingService === service._id ? (
                              <>
                                <button
                                  onClick={() => handleEditSave(service._id)}
                                  className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
                                  onClick={() => handleEditClick(service)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                                  onClick={() => handleDeleteService(service._id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-2 py-1 text-xs sm:text-sm"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className="px-2 py-1 text-xs sm:text-sm min-w-[2rem]"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-2 py-1 text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonService;