import { useEffect, useState } from "react"
import SalonHeader from "../../Components/SalonHeader"
import SalonSidebar from "../../Components/SalonSidebar"
import { getStylists,deleteStylist } from "../../Services/salonAPI"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import SearchInput from "../../Components/SearchInput"
import { IStylist } from "../../interfaces/interface"
import Pagination from "../../Components/Pagination"
import ConfirmationModal from "../../Components/ConfirmationModal"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
const Stylists = () => {
    const [stylists,setStylists] = useState<IStylist[]>([])
    const {salon} = useSelector((state:any)=>state.salon)

    const [currentPage,setCurrentPage] = useState(1);
    const [searchTerm,setSearchTerm] = useState('');
    const [selectedStylist,setSelectedStylist] = useState<IStylist | null>(null)
    const [showDeleteModal , setShowDeleteModal] = useState(false)
    const itemsPerPage = 10
    console.log(salon._id)
    useEffect(()=>{
      const fetchSalonData = async()=>{
        try {
          if (!salon?._id) return; // Ensure salon._id is available before making API call
          const data = {id:salon._id,page:currentPage,limit:itemsPerPage,search:searchTerm}
          const response = await getStylists(data)
          console.log(response,"stylist data")
          setStylists(response.data.result.stylists)
        } catch (error:any) {
          console.log(error)
        }
      }
      fetchSalonData()
    },[salon._id, currentPage, searchTerm])

    const handleDelete = async () => {
      try {
        if(selectedStylist?._id) {
          const response = await deleteStylist(selectedStylist?._id)
          setShowDeleteModal(false);
          setStylists((prevStylists)=>prevStylists.filter((stylist)=>stylist._id!==selectedStylist._id))
          toast.success(response.data.message)
        }
      } catch (error:any) {
        toast.error(error.response.data.message)
      }
     
    };
    
  return (
    <div className="flex min-h-screen">
      <SalonSidebar/>
      <div className="flex-1 flex flex-col">
        <SalonHeader/>
        <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Stylists</h1>
            <Link
              to="/salon/add-stylist" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add New Stylist
            </Link>
          </div>
          <div className="mb-6">
          <SearchInput 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search stylists..."
            />
          </div>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {stylists.map((stylist) => (
                  <tr key={stylist._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{stylist.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{stylist.email}</div>
                      <div className="text-gray-500">{stylist.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 max-w-xs truncate">
                        {stylist.workingHours[0].startTime} - {stylist.workingHours[0].endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {stylist.services.map(s => s.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${stylist.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {stylist.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-8 whitespace-nowrap flex align-middle text-sm font-medium">
                      <Link
                        to={`/salon/stylists/edit/${stylist._id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedStylist(stylist);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stylists.length===0 &&(
                <div className="text-center py-8 text-gray-500">
                    No Stylists Found
                </div>
              )}
          </div>
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={10}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Stylist"
          message={`Are you sure you want to delete ${selectedStylist?.name}?`}
        />
      </div>
    </div>
  )
}

export default Stylists
