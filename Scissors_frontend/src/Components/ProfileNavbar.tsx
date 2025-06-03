import { Link } from "react-router-dom"

const ProfileNavbar = () => {
  return (
      <nav className="bg-black shadow-lg rounded-md w-full max-w-3xl p-4">
        <ul className="flex flex-wrap justify-between text-center">
          <li className="p-2 w-full sm:w-auto">
            <Link
              to="/profile"
              className="block text-white hover:text-blue-600 transition"
            >
              Profile
            </Link>
          </li>
          <li className="p-2 w-full sm:w-auto">
            <Link
              to="/messages"
              className="block  text-white hover:text-blue-600 transition"
            >
              Messages
            </Link>
          </li>
          <li className="p-2 w-full sm:w-auto">
            <Link
              to="/wallet"
              className="block  text-white hover:text-blue-600 transition"
            >
              Wallet
            </Link>
          </li>
          <li className="p-2 w-full sm:w-auto">
            <Link
              to="/appointments"
              className="block  text-white hover:text-blue-600 transition"
            >
              Appointment History
            </Link>
          </li>
          <li className="p-2 w-full sm:w-auto">
            <Link
              to="/settings"
              className="block  text-white hover:text-blue-600 transition"
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
  )
}

export default ProfileNavbar
