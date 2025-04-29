import { useEffect, useState } from "react";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { getStylists, deleteStylist } from "../../Services/salonAPI";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { IStylist } from "../../interfaces/interface";
import ConfirmationModal from "../../Components/ConfirmationModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

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
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search stylists..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-64 text-sm"
            />
          </div>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : stylists.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No stylists found</div>
          ) : (
            <>
              <div className="text-xs sm:text-sm text-gray-600 mb-2">
                Showing {startIndex}-{endIndex} of {totalItems} stylists
              </div>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[100px]">
                        Name
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">
                        Contact
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">
                        Working Hours
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[150px]">
                        Services
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[80px]">
                        Status
                      </th>
                      <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[100px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stylists.map((stylist) => (
                      <tr key={stylist._id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          {stylist.name}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          <div className="text-gray-900">{stylist.email}</div>
                          <div className="text-gray-500">{stylist.phone}</div>
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          <div className="max-w-xs truncate">
                            {stylist.workingHours[0]?.startTime || "N/A"} -{" "}
                            {stylist.workingHours[0]?.endTime || "N/A"}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle">
                          {stylist.services.map((s) => s.name).join(", ") || "None"}
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm align-middle">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              stylist.isAvailable
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {stylist.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 align-middle">
                          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <Link
                              to={`/salon/stylists/edit/${stylist._id}`}
                              className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-indigo-600 hover:text-indigo-900 text-center"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedStylist(stylist);
                                setShowDeleteModal(true);
                              }}
                              className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-2 py-1 text-xs sm:text-sm"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="px-2 py-1 text-xs sm:text-sm min-w-[2rem]"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2 py-1 text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Stylist"
          message={`Are you sure you want to delete ${selectedStylist?.name}?`}
        />
      </div>
    </div>
  );
};

export default Stylists;