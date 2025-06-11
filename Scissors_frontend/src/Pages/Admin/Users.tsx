import AdminHeader from "../../Components/AdminHeader";
import Sidebar from "../../Components/Sidebar";
import { useDispatch } from "react-redux";
import { deleteUser } from "../../Redux/Admin/adminSlice";
import { fetchUsers, deleteUserAPI, blockAndUnblockUser } from "../../Services/adminAPI";
import { useEffect, useState } from "react";
import Table from "../../Components/Table";
import { User } from "../../interfaces/interface";
import Swal from "sweetalert2"
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Users = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [userData,setUserData] = useState<User[]>([])
  const [search,setSearch] = useState("")
  const limit = 10;
  // const users = useSelector((state: any) => state.admin.userData.userData);

 let totalPages =1
 const fetchUsersData = async () => {
  try {
    const data = { page: currentPage, limit: limit,search:search };
    const response = await fetchUsers(data);
    // dispatch(updateUserData(response.data.userData.userData));
    setUserData(response.data.userData.userData)
    totalPages = response.data.userData.totalUserPages
  } catch (error: any) {
    toast.error(error.message);
  }
};
const handleToggleStatus = async (userId: string, isActive: boolean) => {
  try {
    console.log(userId,isActive)
    const response = await blockAndUnblockUser({ userId, isActive });
    // dispatch(updateUserStatus(response.data.updatedUser));
    setUserData((prevUserData)=>
    prevUserData.map((user)=>user._id===userId?{...user,is_Active:!user.is_Active}:user))
    toast.success(response.data.message);
  } catch (error: any) {
    toast.error(error.response.data.error);
  }
};
  useEffect(() => {
    fetchUsersData();
  }, [currentPage,search]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle block/unblock user
 

  // Handle delete user
  const handleDeleteUser = async (id: string) => {
    const result = await Swal.fire({
      title:"Are you Sure?",
      text:"This Action Cannot be Undone!",
      icon:"warning",
      showCancelButton:true,
      confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    })
    if (result.isConfirmed) {
    try {
      const response = await deleteUserAPI({ id });
      dispatch(deleteUser(response.data.deletedUser._id));
      toast.success(response.data.message || "Deleted Successfully");
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }
  };

  const columns = [
    { header: "Name", accessor: "firstname" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Status", accessor: "is_Active" },
  ];

  const actions = [
    {
      label:"Toggle Status",
      className: "bg-blue-500 text-white py-1 px-4 rounded",
      onClick: (row: any) => handleToggleStatus(row._id, !row.is_Active),
      isDynamic:true
    },
    {
      label: "Delete",
      className: "bg-red-700 text-white py-1 px-4 rounded",
      onClick: (row: any) => handleDeleteUser(row._id),
      isDynamic:false
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1">
        <AdminHeader />
        <div className="p-4 sm:p-8">
          <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-center sm:text-left">
            User Management
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
          {/* Table Component */}
          <div className="overflow-x-auto">
            <Table columns={columns} data={userData} actions={actions} />
          </div>

          {/* Pagination */}
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

export default Users;
