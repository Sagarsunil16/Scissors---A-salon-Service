// Pages/User/UserDashboard.tsx

import Footer from "../../Components/Footer";
import Navbar from "../../Components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from 'react-redux';
import { signOut } from '../../Redux/User/userSlice';
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
const UserDashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const signout = async()=>{
        try {
            const response = await axios.post('http://localhost:3000/signout')
            console.log(response)
            dispatch(signOut())
            navigate('/login')
            toast.success(response.data.message)
        } catch (error:any) {
            toast.error(error.response.data.message)
        }
   }
  return (
    <div>
    <Navbar/>
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-4 sm:px-8 pt-16">
    <h1 className="text-5xl">Welcome to Scissors</h1>
    <button className="m-5 bg-black text-white p-4 rounded-lg" onClick={signout}>Log out</button>
    </div>
     
      {/* Render user-specific content here */}
      <Footer/>
    </div>
  );
};

export default UserDashboard;
