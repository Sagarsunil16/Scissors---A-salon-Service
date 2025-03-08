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
} from "../../Services/salonAPI";

interface Service {
  _id: string;
  name: string;
  description: string;
  service: string;
  price: number;
}

const SalonService = () => {
  const { salon } = useSelector((state: any) => state.salon);

  const [fetchedServices, setFetchedServices] = useState<Service[]>([]);
  const [salonServices, setSalonServices] = useState<Service[]>(
    salon.serviceIds || []
  );
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    service: "",
  });
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const serviceData = await getAllService();
        setFetchedServices(serviceData.data.services);
        const data = { id: salon._id };
        const salonData = await getSalonData(data);
        console.log(salonData, "sadasd");
        setSalonServices(salonData.data.salonData.services);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      const data = { id: salon._id, ...values };
      console.log(values);
      const response = await addService(data);
      setSalonServices(response.data.updatedSalonData.services);
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleEditClick = (service: any) => {
    setEditingService(service._id);
    setEditForm({
      name: service.name,
      description: service.description,
      price: service.price,
      service: service.service,
    });
  };

  const handleEditCancel = () => {
    setEditingService(null);
    setEditForm({ name: "", description: "", price: "", service: "" });
  };

  const handleEditSave = async (id: string) => {
    try {
      console.log(salonServices, "Before Update"); // Debugging

      const salonId = salon._id;
      const serviceId = id;
      const data = { salonId, serviceId, ...editForm };

      const response = await updateService(data);
      const updatedService = response.data.result; // Make sure this has the correct structure

      console.log(updatedService, "Updated Service Data");

      // Ensure React detects state change by creating a new array reference
      setSalonServices((prevServices) =>
        prevServices.map((service) =>
          service._id === serviceId
            ? { ...service, ...updatedService }
            : service
        )
      );

      // Reset form and editing state
      setEditingService(null);
      setEditForm({ name: "", description: "", price: "", service: "" });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  return (
    <div className="flex h-screen">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Salon Services</h2>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Service</th>
                  <th className="border border-gray-300 px-4 py-2">Price</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salonServices.map((service, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {editingService === service._id ? (
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          className="border rounded px-2 py-2 w-full"
                          onChange={handleInputChange}
                        />
                      ) : (
                        service.name
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingService === service._id ? (
                        <input
                          type="text"
                          name="description"
                          value={editForm.description}
                          className="border rounded px-2 py-2 w-full"
                          onChange={handleInputChange}
                        />
                      ) : (
                        service.description
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingService === service._id ? (
                        <select
                          name="service"
                          value={editForm.service}
                          className="border rounded px-2 py-2 w-full"
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
                        service.name
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingService === service._id ? (
                        <input
                          type="text"
                          name="price"
                          value={editForm.price}
                          className="border rounded px-2 py-2 w-full"
                          onChange={handleInputChange}
                        />
                      ) : (
                        service.price
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                      {editingService === service._id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(service._id)}
                            className="bg-green-500 text-white text-sm px-2 py-1 rounded hover:bg-green-600 mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="bg-gray-500 text-white text-sm px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                            onClick={() => handleEditClick(service)}
                          >
                            Edit
                          </button>
                          <button className="bg-red-500 text-white px-3 py-1 rounded">
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link to={"/salon/add-service"}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Service
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalonService;
