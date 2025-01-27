import { FiBell } from "react-icons/fi"; // Bell icon
import { FaUserCircle } from "react-icons/fa"; // Profile icon
import { useSelector } from "react-redux";

const AdminHeader = () => {
   const {firstname,lastname} = useSelector((state:any)=>state?.user?.currentUser)
  
  return (
    <div className="flex justify-between items-center bg-white p-4 shadow">
      {/* Good Morning Message */}
      <h3 className="text-xl font-semibold text-gray-400">Good Morning, <h2 className="font-semibold text-2xl flex justify-center text-gray-700">{`${firstname}${' '}${lastname}`}</h2></h3>
      

      {/* Right Side: Search, Bell, and Profile */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bell Icon */}
        <div className="text-gray-600 hover:text-blue-500 cursor-pointer">
          <FiBell size={24} />
        </div>

        {/* Profile Icon */}
        <div className="text-gray-600 hover:text-blue-500 cursor-pointer">
          <FaUserCircle size={28} />
        </div>
      </div>
    </div>
  )
}

export default AdminHeader
