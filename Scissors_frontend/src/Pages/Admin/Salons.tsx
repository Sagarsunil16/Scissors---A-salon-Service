
import { useState } from "react"
import Sidebar from "../../Components/Sidebar"
import AdminHeader from "../../Components/AdminHeader"
import Table from "../../Components/Table"
import { useDispatch, useSelector } from "react-redux"
import { blockAndUnblockSalon } from '../../Services/adminAPI'
import { updateSalonStatus } from "../../Redux/Admin/adminSlice"


const Salons = () => {
  const dispatch = useDispatch()
    const [currentPage,setCurrentPage] = useState(1)
    const salons = useSelector((state:any)=>state.admin.salonData.salonData)
    const totalPages = useSelector((state:any)=>state.admin.salonData.totalSalonPages)
    const handlePageChange = async(page:number)=>{
        if(page>0 && page<=totalPages){
            setCurrentPage(page)
        }
    }
    
    const handleBlockAndUnblock =  async(salonId:string,isActive:boolean)=>{
        try {
            const data = {salonId,isActive}
            const response = await blockAndUnblockSalon(data)
            dispatch(updateSalonStatus(response.data.updatedSalon))
           alert("Done")
        } catch (error:any) {
            alert(error.message)
        }
    }

    const columns = [
        {header:"Name",accessor:"salonName"},
        {header:"email",accessor:"email"},
        {header:"phone",accessor:"phone"},
        {header:"address",accessor:"address"},
        {header:"status",accessor:"is_Active"}
    ]

    const actions  = [
        {
            label:"Block",
            className:"bg-red-500 text-white py-1 px-4 rounded",onClick:(row:any)=>{row.is_Active? handleBlockAndUnblock(row._id,false):null}
        },
        {
            label:"Unblock",
            className:"bg-green-500 text-white py-1 px-4 rounded",
            onClick:(row:any)=>{
                !row.is_Active?handleBlockAndUnblock(row._id,true):null
            }
        }
    ]
  return (
   
    <div className="flex flex-col sm:flex-row">
        <Sidebar />
        <div className="flex-1">
        <AdminHeader/>
        <div className="p-4 sm:p-8">
            <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-center sm:text-left">
                Salon Management
            </h2>
            <div className="overflow-x-auto">
                <Table columns={columns} data={salons} actions={actions}/>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-10">
            <button
              className="bg-gray-300 py-2 px-6 rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <span className="text-sm sm:text-base">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="bg-gray-300 py-2 px-6 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
        </div>
      
    </div>
  )
}

export default Salons
