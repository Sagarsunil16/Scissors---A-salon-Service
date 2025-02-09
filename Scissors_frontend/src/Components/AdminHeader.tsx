import { FiBell } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
const AdminHeader = () => {
  const { firstname, lastname } = useSelector(
    (state: any) => state?.admin?.currentUser
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 shadow gap-4 sm:gap-0 relative">
      {/* Greeting Section */}
      <div className="w-full sm:w-auto text-center sm:text-left">
        <h3 className="text-base sm:text-lg font-semibold text-gray-400">
          Good Morning,
        </h3>
        <h2 className="font-semibold text-lg sm:text-2xl text-gray-700">
          {`${firstname} ${lastname}`}
        </h2>
      </div>

      {/* Right Section: Search */}
      <div className="w-full sm:w-64">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notification & Profile Icons */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 sm:static sm:space-x-4">
        {/* Notification Icon */}
        <div className="text-gray-600 hover:text-blue-500 cursor-pointer">
          <FiBell size={24} />
        </div>

        {/* Profile Icon */}
        <Link to={'/admin/profile'}>
        <div className="text-gray-600 hover:text-blue-500 cursor-pointer">
          <FaUserCircle size={28} />
        </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminHeader;