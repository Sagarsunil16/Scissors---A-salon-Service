import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut } from "../Redux/Salon/salonSlice";
import { signOutSalon } from "../Services/salonAPI";

const SalonSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      console.log("Toggling sidebar, new state:", !prev);
      return !prev;
    });
  };

  const signout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const response = await signOutSalon();
      console.log(response);
      dispatch(signOut());
      navigate("/salon/login");
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button for Mobile Menu */}
      <button
        className="fixed top-4 left-4 text-white bg-gray-800 hover:bg-gray-600 p-2 rounded-full sm:hidden z-50"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white p-4 flex flex-col transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:static sm:translate-x-0 sm:min-h-screen shadow-lg`}
      >
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-200 text-center py-4">
          SCISSORS
        </h1>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2 mt-4 flex-1">
          <Link
            to="/salon/dashboard"
            className={`text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors ${
              location.pathname === "/salon/dashboard" ? "bg-purple-700 text-white" : ""
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/salon/profile"
            className={`text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors ${
              location.pathname === "/salon/profile" ? "bg-purple-700 text-white" : ""
            }`}
          >
            Profile
          </Link>
          <Link
            to="/salon/service"
            className={`text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors ${
              location.pathname === "/salon/service" ? "bg-purple-700 text-white" : ""
            }`}
          >
            Services
          </Link>
          <Link
            to="/salon/stylists"
            className={`text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors ${
              location.pathname === "/salon/stylists" ? "bg-purple-700 text-white" : ""
            }`}
          >
            Stylists
          </Link>
          <Link
            to="/salon/bookings"
            className={`text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors ${
              location.pathname === "/salon/bookings" ? "bg-purple-700 text-white" : ""
            }`}
          >
            Bookings
          </Link>
          <Link
            to="/salon/messages"
            className={`text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors ${
              location.pathname === "/salon/messages" ? "bg-purple-700 text-white" : ""
            }`}
          >
            Messages
          </Link>
          <Link
            to="/salon/offers"
            className={`text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors ${
              location.pathname === "/salon/offers" ? "bg-purple-700 text-white" : ""
            }`}
          >
            Offers
          </Link>
          <Link
            to="/salon/gallery"
            className={`text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors ${
              location.pathname === "/salon/gallery" ? "bg-purple-700 text-white" : ""
            }`}
          >
            Gallery
          </Link>
          <a
            onClick={signout}
            className="text-gray-200 hover:bg-purple-700 hover:text-white px-4 py-2 rounded-md text-sm sm:text-base transition-colors cursor-pointer"
          >
            Sign Out
          </a>
        </nav>
      </div>

      {/* Overlay for Mobile Menu */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30 sm:hidden pointer-events-auto"
          onClick={toggleMenu}
        ></div>
      )}
    </div>
  );
};

export default SalonSidebar;