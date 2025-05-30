import { useEffect, useState } from "react";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { getStylists, deleteStylist } from "../../Services/salonAPI";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "../../Components/ui/button";
import { IStylist } from "../../interfaces/interface";
import ConfirmationModal from "../../Components/ConfirmationModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReusableTable, { Column } from "../../Components/ReusableTable";

const Stylists = () => {
  const [stylists, setStylists] = useState<IStylist[]>([]);
  const { salon } = useSelector((state: any) => state.salon);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStylist, setSelectedStylist] = useState<IStylist | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        if (!salon?._id) return;
        setLoading(true);
        const data = {
          id: salon._id,
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
        };
        const response = await getStylists(data);
        console.log(response,"stylist reponse")
        setStylists(response.data.result.stylists);
        setTotalItems(response.data.result.total || response.data.result.stylists.length);
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to fetch stylists");
      } finally {
        setLoading(false);
      }
    };
    fetchSalonData();
  }, [salon._id, currentPage, searchTerm]);

  const handleDelete = async () => {
    try {
      if (selectedStylist?._id) {
        const response = await deleteStylist(selectedStylist._id);
        setShowDeleteModal(false);
        setStylists((prevStylists) =>
          prevStylists.filter((stylist) => stylist._id !== selectedStylist._id)
        );
        setTotalItems((prev) => prev - 1);
        if (stylists.length <= 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete stylist");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: Column<IStylist>[] = [
    {
      header: "Name",
      accessor: "name",
      minWidth: "100px",
    },
    {
      header: "Contact",
      accessor: "email",
      minWidth: "120px",
      render: (item: IStylist) => (
        <div>
          <div className="text-gray-900">{item.email}</div>
          <div className="text-gray-500">{item.phone}</div>
        </div>
      ),
    },
    {
      header: "Working Hours",
      accessor: "workingHours",
      minWidth: "120px",
      render: (item: IStylist) => (
        <div className="max-w-xs truncate">
          {item.workingHours[0]?.startTime || "N/A"} - {item.workingHours[0]?.endTime || "N/A"}
        </div>
      ),
    },
    {
      header: "Services",
      accessor: "services",
      minWidth: "150px",
      render: (item: IStylist) => item.services.map((s) => s.name).join(", ") || "None",
    },
    {
      header: "Status",
      accessor: "isAvailable",
      minWidth: "80px",
      render: (item: IStylist) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {item.isAvailable ? "Available" : "Unavailable"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: () => {}, // Handled by Link in render
      className:
        "w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-indigo-600 hover:text-indigo-900 text-center",
      render: (item: IStylist) => (
        <Link
          to={`/salon/stylists/edit/${item._id}`}
          className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-indigo-600 hover:text-indigo-900 text-center"
        >
          Edit
        </Link>
      ),
    },
    {
      label: "Delete",
      onClick: (item: IStylist) => {
        setSelectedStylist(item);
        setShowDeleteModal(true);
      },
      className:
        "w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-red-600 hover:text-red-900",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white md:flex-row">
      <SalonSidebar />
      <div className="flex-1 flex flex-col w-full">
        <SalonHeader />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-semibold">Manage Stylists</h1>
            <Link to="/salon/add-stylist">
              <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600">
                Add New Stylist
              </Button>
            </Link>
          </div>
          <ReusableTable<IStylist>
            columns={columns}
            data={stylists}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            loading={loading}
            searchQuery={searchTerm}
            editingId={null} // No inline editing
            editForm={{}} // No edit form
            onSearchChange={handleSearchChange}
            onPageChange={handlePageChange}
            actions={actions}
            getRowId={(item: IStylist) => item._id}
          />
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            title="Delete Stylist"
            message={`Are you sure you want to delete ${selectedStylist?.name}?`}
          />
        </div>
      </div>
    </div>
  );
};

export default Stylists;