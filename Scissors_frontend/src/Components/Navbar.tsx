import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Navbar = () => {
  const currentUser =  useSelector((state:any)=>state.user.currentUser)
  console.log(currentUser)
  const [isOpen, setIsOpen] = useState(false); 

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div>
      <nav className="bg-white shadow-md p-4 fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="text-3xl font-thin text-gray-400 font-portLligat">
            <Link to={"/"}>SCISSORS</Link>
          </div>

      
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 md:hidden block focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-6 text-gray-700 items-center font-poppins">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  className="hover:text-blue-500 transition duration-500"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {/* Action Buttons */}
            {!currentUser && <div className="flex space-x-4">
              <Link to={"/login"}>
                <button className="px-4 py-2 text-black border rounded-sm hover:bg-gray-200 transition duration-300">
                  Login
                </button>
              </Link>
              <Link to={"/signup"}>
                <button className="px-4 py-2 text-white bg-black border rounded-sm shadow hover:bg-gray-700 transition duration-300">
                  SignUp
                </button>
              </Link>
            </div> }
            
          </ul>
        </div>

     
        <div
          className={`${
            isOpen ? "absolute" : "hidden"
          } md:hidden top-full left-0 w-full bg-white rounded-lg shadow-lg z-40`}
        >
          <ul className="space-y-4 p-4 text-gray-700 font-poppins">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  className="block hover:text-blue-500 transition duration-500"
                  onClick={() => setIsOpen(false)} 
                >
                  {link.name}
                </Link>
              </li>
            ))}
          
            <div className="flex flex-col space-y-4 mt-4">
              <Link to={"/login"}>
                <button className="w-full px-4 py-2 text-black border rounded-sm hover:bg-gray-200 transition duration-300">
                  Login
                </button>
              </Link>
              <Link to={"/signup"}>
                <button className="w-full px-4 py-2 text-white bg-black border rounded-sm shadow hover:bg-gray-700 transition duration-300">
                  SignUp
                </button>
              </Link>
            </div>
          </ul>
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
