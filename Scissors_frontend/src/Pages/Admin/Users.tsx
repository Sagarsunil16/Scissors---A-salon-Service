import AdminHeader from "../../Components/AdminHeader";
import Sidebar from "../../Components/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { updateUserStatus, deleteUser } from "../../Redux/Admin/adminSlice";
import { fetchUsers, deleteUserAPI, blockAndUnblockUser } from "../../Services/adminAPI";
import { updateUserData } from "../../Redux/Admin/adminSlice";
import { useEffect, useState } from "react";
import Table from "../../Components/Table";

const Users = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
 
  const limit = 10;
  const users = useSelector((state: any) => state.admin.userData.userData);
  const totalPages = Number(useSelector((state: any) => state.admin.userData.totalUserPages))
 
  console.log(totalPages,"totalPages")
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const data = { page: currentPage, limit: limit };
        const response = await fetchUsers(data);
        dispatch(updateUserData(response.data.userData.userData));
      } catch (error: any) {
        alert(error.message);
      }
    };
    fetchUsersData();
  }, [currentPage, dispatch]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle block/unblock user
  const handleBlockAndUnblock = async (userId: string, isActive: boolean) => {
    try {
      const response = await blockAndUnblockUser({ userId, isActive });
      dispatch(updateUserStatus(response.data.updatedUser));
      alert("Done");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id: string) => {
    try {
      const response = await deleteUserAPI({ id });
      dispatch(deleteUser(response.data.deletedUser._id));
      alert("Deleted Successfully");
    } catch (error: any) {
      alert(error.message);
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
      label: "Block",
      className: "bg-red-500 text-white py-1 px-4 rounded",
      onClick: (row: any) =>
        row.is_Active ? handleBlockAndUnblock(row._id, false) : null,
    },
    {
      label: "Unblock",
      className: "bg-green-500 text-white py-1 px-4 rounded",
      onClick: (row: any) =>
        !row.is_Active ? handleBlockAndUnblock(row._id, true) : null,
    },
    {
      label: "Delete",
      className: "bg-red-700 text-white py-1 px-4 rounded",
      onClick: (row: any) => handleDeleteUser(row._id),
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
          {/* Table Component */}
          <div className="overflow-x-auto">
            <Table columns={columns} data={users} actions={actions} />
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
