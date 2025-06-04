import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import AdminHeader from "../../Components/AdminHeader";
import Table from "../../Components/Table";
import { useDispatch, useSelector } from "react-redux";
import { blockAndUnblockSalon, fetchSalons } from "../../Services/adminAPI";
import { ISalon } from "../../interfaces/interface";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Salons = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [salonData, setSalonData] = useState<ISalon[]>([]);
  const salons = useSelector((state: any) => state.admin.salonData.salonData);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const handlePageChange = async (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const fetchSalonData = async (page: number) => {
    try {
      const data = { page: page, search: search };
      const response = await fetchSalons(data);
      setSalonData(response.data.salonData);
      setTotalPages(response.data.totalPages);
      console.log("Fetched successfully");
    } catch (error: any) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchSalonData(currentPage);
  }, [currentPage, search]);
  const handleBlockAndUnblock = async (salonId: string, isActive: boolean) => {
    try {
      const response = await blockAndUnblockSalon({ salonId, isActive });
      setSalonData((prevSalonData) =>
        prevSalonData.map((salon) =>
          salon._id == salonId
            ? { ...salon, is_Active: !salon.is_Active }
            : salon
        )
      );
      toast.success(
        response.data.message || "Salon status updated successfully",
        { position: "top-right" }
      );
    } catch (error: any) {
      toast.error(error.response.data.error || `Error: ${error.message}`, {
        position: "top-right",
      });
    }
  };

  const columns = [
    { header: "Name", accessor: "salonName" },
    { header: "email", accessor: "email" },
    { header: "phone", accessor: "phone" },
    { header: "address", accessor: "address" },
    { header: "status", accessor: "is_Active" },
  ];

  const actions = [
    {
      label: "Toggle Status",
      className: "bg-blue-500 text-white py-1 px-4 rounded",
      onClick: (row: any) => {
        handleBlockAndUnblock(row._id, !row.is_Active);
      },
      isDynamic: true,
    },
  ];
  return (
    <div className="flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1">
        <AdminHeader />
        <div className="p-4 sm:p-8">
          <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-center sm:text-left">
            Salon Management
          </h2>
          <div className="flex justify-end mb-4">
            <input
              type="text"
              placeholder="Search salons..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="border px-3 py-2 rounded-md w-full md:w-1/3"
            />
          </div>
          <div className="overflow-x-auto">
            <Table columns={columns} data={salonData} actions={actions} />
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
    </div>
  );
};

export default Salons;
