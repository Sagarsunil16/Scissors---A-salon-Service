import { useEffect, useState } from "react";
import AdminHeader from "../../Components/AdminHeader";
import Sidebar from "../../Components/Sidebar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllCategory,
  deleteCategory,
  editCategory,
} from "../../Services/adminAPI";
import { Category } from "../../interfaces/interface";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Pagination from "../../Components/Pagination";
const AdminCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [currentPage,setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [search , setSearch] = useState("")
  const [isLoading,setIsLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const handleDeleteCategory = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you Sure?",
      text: "This Action Cannot be Undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        const data = { id: id };
        const response = await deleteCategory(data);
        console.log(response.data);
        setCategories(categories.filter((cat: any) => cat._id !== id));
        fetchCategories(currentPage);
        toast.success(response.data.message)
      } catch (error: any) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleEditClick = (category:any) => {
    setEditingCategory(category._id);
    setEditForm({ name: category.name, description: category.description });
  };

  const handleEditChange = (e:any) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSave = async (id: string) => {
    try {
      setIsLoading(true)
      const data = { id, ...editForm };
      const response = await editCategory(data);
      if (response.status == 200) {
        fetchCategories(currentPage);
        setEditingCategory(null);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditForm({ name: "", description: "" });
  };

  const fetchCategories = async (page:number) => {
    try {
      setIsLoading(true)
      const data = await getAllCategory(page,itemsPerPage,search);
      console.log(data,"dataa")
      setCategories(data.data.categories);
      setTotalItems(data.data.Pagination.totalItems)
    } catch (error: any) {
      toast.error(error.message);
    }finally{
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage,search]);

  const handlePage = (page:number)=>{
    setCurrentPage(page)
  }
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        <AdminHeader />
        
        <h1 className="text-lg md:text-xl font-bold mb-4">Manage Categories</h1>
        <div className="flex justify-end mb-4">
  <input
    type="text"
    placeholder="Search categories..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setCurrentPage(1); // Reset to first page on search
    }}
    className="border px-3 py-2 rounded-md w-full md:w-1/3"
  />
       
</div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ):(
          <div>
          <h2 className="text-md md:text-lg font-semibold mb-4">
            Category List
          </h2>
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 md:px-4 py-2">Name</th>
                    <th className="px-2 md:px-4 py-2">Description</th>
                    <th className="px-2 md:px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td className="border px-2 md:px-4 py-2">
                        {editingCategory === category._id ? (
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          category.name
                        )}
                      </td>
                      <td className="border px-2 md:px-4 py-2">
                        {editingCategory === category._id ? (
                          <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          category.description
                        )}
                      </td>
                      <td className="border px-2 md:px-4 py-2">
                        {editingCategory === category._id ? (
                          <>
                            <button
                              onClick={() => handleEditSave(category._id)}
                              className="bg-green-500 text-white text-sm px-2 py-1 rounded hover:bg-green-600 mr-2"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 text-white text-sm px-2 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(category)}
                              className="bg-blue-500 text-white text-sm px-2 py-1 rounded hover:bg-blue-600 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No categories added yet.</p>
          )}
        </div>
        )
      }
        
        {/* Add New Category Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/admin/add-category")}
            className="bg-blue-500 text-white text-sm md:text-base px-4 py-2 md:px-6 md:py-2 rounded hover:bg-blue-600 focus:ring focus:ring-blue-200 focus:outline-none"
          >
            Add New Category
          </button>
         
        </div>
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={10} onPageChange={handlePage}/>
      </div>

    </div>
  );
};

export default AdminCategory;
