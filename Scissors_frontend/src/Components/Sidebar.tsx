
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from 'react-redux';
import { signOut } from '../Redux/User/userSlice';
const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const signout = async(e:React.MouseEvent<HTMLAnchorElement>)=>{
       e.preventDefault();
       try {
           const response = await axios.post('http://localhost:3000/admin/signout')
           console.log(response)
           dispatch(signOut())
           navigate('/admin/login')
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
        to="/admin/dashboard"
        className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded"
      >
        Dashboard
      </Link>
      <Link
        to="/admin/users"
        className="text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded"
      >
        Users
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

export default Sidebar
