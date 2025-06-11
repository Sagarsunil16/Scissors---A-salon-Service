import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { useSelector } from "react-redux";
import {
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
import ReusableTable, { Column } from "../../Components/ReusableTable";

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
  const [stylists, setStylists] = useState<IStylist[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    service: "",
    duration: 30,
    stylists: [] as string[],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  // Fetch all services and stylists
  const fetchServices = async () => {
    try {
      setLoading(true);
      const [ salonData, stylistData] = await Promise.all([
        // getAllService(),
        getSalonData({ id: salon._id }),
        getStylists({ id: salon._id }),
      ]);
      setFetchedServices(salonData.data.salonData.services);
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
  }, [salon._id, editingService]);

  // Client-side filtering
  const filteredServices = useMemo(() => {
    if (!searchQuery) return fetchedServices;

    return fetchedServices.filter((service) =>
      [service.name, service.description, service.service.name, service.price.toString()]
        .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [fetchedServices, searchQuery]);

  // Paginate filtered services
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  const totalServices = filteredServices.length;

  const handleEditClick = (service: Service) => {
    setEditingService(service._id);
    setEditForm({
      name: service.name,
      description: service.description,
      price: service.price,
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
      price: 0,
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

      setFetchedServices((prevServices) =>
        prevServices.map((service) =>
          service._id === serviceId ? { ...service, ...updatedService } : service
        )
      );
      toast.success(response.data.message);
      setEditingService(null);
      setEditForm({
        name: "",
        description: "",
        price: 0,
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

  const handleDeleteService = async (service: Service) => {
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
        const serviceId = service._id;
        const data = { salonId, serviceId };
        const response = await deleteService(data);
        toast.success(response.data.message);
        setFetchedServices((prevServices) =>
          prevServices.filter((s) => s._id !== serviceId)
        );
        if (paginatedServices.length <= 1 && currentPage > 1) {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: Column<Service>[] = [
    {
      header: "Name",
      accessor: "name",
      minWidth: "150px",
      render: (item: Service, isEditing: boolean, editForm: any) =>
        isEditing ? (
          <input
            type="text"
            name="name"
            value={editForm.name}
            className="border rounded px-2 py-1 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleInputChange}
          />
        ) : (
          <span className="text-xs sm:text-sm">{item.name}</span>
        ),
    },
    {
      header: "Description",
      accessor: "description",
      minWidth: "200px",
      render: (item: Service, isEditing: boolean, editForm: any) =>
        isEditing ? (
          <input
            type="text"
            name="description"
            value={editForm.description}
            className="border rounded px-2 py-1 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleInputChange}
          />
        ) : (
          <span className="text-xs sm:text-sm line-clamp-2">{item.description}</span>
        ),
    },
    {
      header: "Service",
      accessor: "service",
      minWidth: "150px",
      render: (item: Service, isEditing: boolean, editForm: any) =>
        isEditing ? (
          <select
            name="service"
            value={editForm.service}
            className="border rounded px-2 py-1 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <span className="text-xs sm:text-sm">{item.service.name}</span>
        ),
    },
    {
      header: "Price",
      accessor: "price",
      minWidth: "100px",
      render: (item: Service, isEditing: boolean, editForm: any) =>
        isEditing ? (
          <input
            type="text"
            name="price"
            value={editForm.price}
            className="border rounded px-2 py-1 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleInputChange}
          />
        ) : (
          <span className="text-xs sm:text-sm">Rs {item.price}</span>
        ),
    },
    {
      header: "Duration",
      accessor: "duration",
      minWidth: "100px",
      render: (item: Service, isEditing: boolean, editForm: any) =>
        isEditing ? (
          <input
            type="number"
            min="15"
            step="15"
            value={editForm.duration}
            className="border rounded px-2 py-1 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleDurationChange}
          />
        ) : (
          <span className="text-xs sm:text-sm">{item.duration} mins</span>
        ),
    },
    {
      header: "Stylists",
      accessor: "stylists",
      minWidth: "150px",
      render: (item: Service, isEditing: boolean, editForm: any) =>
        isEditing ? (
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
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                />
                <span>{stylist.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <span className="text-xs sm:text-sm">
              { item.stylists && item.stylists.length > 0?
              item.stylists
              .map((stylist) => stylists.find((s) => s._id === stylist._id)?.name)
              .filter(Boolean)
              .join(", ")
                :
              <p className="text-red-600">
                Please Add A stylist
              </p>
    }
          </span>
        ),
    },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: handleEditClick,
      className:
        "w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-indigo-600 hover:text-indigo-900",
    },
    {
      label: "Delete",
      onClick: handleDeleteService,
      className:
        "w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-red-600 hover:text-red-900",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white md:flex-row">
      <SalonSidebar />
      <div className="flex-1 flex flex-col w-full">
        <SalonHeader />
        <main className="p-4 sm:p-6 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Salon Services</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              
              <Link to="/salon/add-service" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm py-2">
                  Add Service
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-white ">
            <ReusableTable<Service>
              columns={columns}
              data={paginatedServices}
              totalItems={totalServices}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              editingId={editingService}
              editForm={editForm}
              onPageChange={handlePageChange}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
              onInputChange={handleInputChange}
              actions={actions}
              getRowId={(item: Service) => item._id}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalonService;