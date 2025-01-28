import { FiBell } from "react-icons/fi"; 
import { FaUserCircle } from "react-icons/fa"; 
import { useSelector } from "react-redux";

const SalonHeader = () => {
   const {salonName} = useSelector((state:any)=>state?.salon?.salon)
  
  return (
    <div className="flex justify-between items-center bg-white p-4 shadow">
    
      <h3 className="text-xl font-semibold text-gray-400">Good Morning, <h2 className="font-semibold text-2xl flex justify-center text-gray-700">{`${salonName}`}</h2></h3>
      

 
      <div className="flex items-center space-x-4">
       
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

       
        <div className="text-gray-600 hover:text-blue-500 cursor-pointer">
          <FiBell size={24} />
        </div>

      
        <div className="text-gray-600 hover:text-blue-500 cursor-pointer">
          <FaUserCircle size={28} />
        </div>
      </div>
    </div>
  )
}

export default SalonHeader
