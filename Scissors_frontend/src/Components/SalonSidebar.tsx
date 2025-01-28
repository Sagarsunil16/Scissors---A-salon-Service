
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import {signOut} from '../Redux/Salon/salonSlice'
import { signOutSalon } from '../Services/salonAPI';
const SalonSidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const signout = async(e:React.MouseEvent<HTMLAnchorElement>)=>{
       e.preventDefault();
       try {
           const response = await signOutSalon()
           console.log(response)
           dispatch(signOut())
           navigate('/salon/login')
       } catch (error:any) {
           console.log(error.message)
       }
  }
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 flex flex-col">
    {/* Scissors Branding */}
    <h1 className="text-3xl font-thin text-gray-400 font-portLligat flex justify-center py-2">SCISSORS</h1>

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
      <a
        onClick={signout}
        className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded cursor-pointer"
      >
        Sign Out
      </a>
    </nav>
  </div>
  )
}

export default SalonSidebar
