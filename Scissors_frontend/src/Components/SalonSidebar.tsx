import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut } from "../Redux/Salon/salonSlice";
import { signOutSalon } from "../Services/salonAPI";

const   SalonSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
    <div className="relative ">
      {/* Toggle Button for Mobile Menu */}
      <button
        className="absolute top-4 left-4 text-white bg-gray-800 p-2 rounded-md md:hidden z-50"
        onClick={toggleMenu}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white p-4 flex flex-col transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0 md:relative md:min-h-screen`}
      >
        <h1 className="text-3xl font-thin text-gray-400 font-portLligat flex justify-center py-4">
          SCISSORS
        </h1>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-4 mt-2">
          <Link
            to="/salon/dashboard"
            className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded"
          >
            Dashboard
          </Link>
          <Link
            to="/salon/profile"
            className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded"
          >
            Profile
          </Link>

          <Link
            to="/salon/stylist"
            className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded"
          >
            Stylists
          </Link>

          <Link
            to="/salon/service"
            className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded"
          >
            Services
          </Link>

          <Link
            to="/salon/gallery"
            className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded"
          >
            Gallery
          </Link>

          <a
            onClick={signout}
            className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded cursor-pointer"
          >
            Sign Out
          </a>
        </nav>
      </div>  

      {/* Overlay for Mobile Menu */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMenu}
        ></div>
      )}
    </div>
  );
};

export default SalonSidebar;
