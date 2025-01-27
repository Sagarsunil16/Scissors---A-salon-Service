import AdminHeader from "../../Components/AdminHeader";
import Sidebar from "../../Components/Sidebar";
import { useSelector } from "react-redux";
 

const Users = () => {

  const users = useSelector((state: any) => state.admin.userData);


  return (
    <div>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <AdminHeader />
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: any) => (
                  <tr key={user._id}>
                    <td className="border p-2">{user.firstname} {user.lastname}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{user.phone}</td>
                    <td className="border p-2">
                      {user.is_Active ? (
                        <span className="text-green-500">Active</span>
                      ) : (
                        <span className="text-red-500">Blocked</span>
                      )}
                    </td>
                    <td className="border p-2 flex space-x-2 justify-center">
                      {user.is_Active ? (
                        <button
                          
                          className="bg-red-500 text-white py-1 px-4 rounded"
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          className="bg-green-500 text-white py-1 px-4 rounded"
                        >
                          Unblock
                        </button>
                      )}

                      <button
                        className="bg-red-700 text-white py-1 px-4 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
