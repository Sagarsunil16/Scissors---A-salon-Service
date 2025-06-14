import { FiBell } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";

const SalonHeader = () => {
  const { salonName } = useSelector((state: any) => state?.salon?.salon);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 shadow gap-4 sm:gap-0 relative">
      {/* Greeting Section */}
      <div className="w-full sm:w-auto text-center sm:text-left">
        <h3 className="text-base sm:text-lg font-semibold text-gray-400">
          Good Morning,
        </h3>
        <h2 className="font-semibold text-lg sm:text-2xl text-gray-700">
          {`${salonName}`}
        </h2>
      </div>

     

      {/* Notification & Profile Icons */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 sm:static sm:space-x-4">
        {/* Notification Icon */}
        <div className="text-gray-600 hover:text-blue-500 cursor-pointer">
          <FiBell size={24} />
        </div>

        {/* Profile Icon */}
        <div className="text-gray-600 hover:text-blue-500 cursor-pointer">
          <FaUserCircle size={28} />
        </div>
      </div>
    </div>
  );
};

export default SalonHeader;
