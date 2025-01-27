import Sidebar from "../../Components/Sidebar";
import AdminHeader from "../../Components/AdminHeader";
const AdminDashboard = () => {
  return (
    <div>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ">
            <AdminHeader/>
            <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">
            Welcome to the Admin Dashboard
          </h1>
          <p className="mt-4 text-gray-600">
            Use the navigation on the left to explore the dashboard features.
          </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
