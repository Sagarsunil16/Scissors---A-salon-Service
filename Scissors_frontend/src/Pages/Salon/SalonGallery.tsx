import { useState } from "react";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { uploadImage, deleteImage } from "../../Services/salonAPI";
import { useDispatch, useSelector } from "react-redux";
import { addImagesSalon, deleteImageSalon,start,stop } from "../../Redux/Salon/salonSlice";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
const SalonGallery = () => {
  const { salon,loading } = useSelector((state: any) => state.salon);
  const dispatch = useDispatch();
  const [file, setFile] = useState(null); // For image upload

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return alert("Please select an image to upload!");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("salonId", salon._id);

    try {
        dispatch(start())
      const response = await uploadImage(formData);
      console.log(response, "response");
      dispatch(addImagesSalon(response.data.updatedSalonData))
      toast.success(response.data.message)
      setFile(null); // Clear the selected file
    } catch (error:any) {
      console.error("Image upload failed:", error);
      toast.error(error.message);
      dispatch(stop(error.message))
    }
  };

  const handleDelete = async (imageId: string,cloudinaryImageId:string) => {
     const result = await Swal.fire({
          title:"Are you Sure?",
          text:"This Action Cannot be Undone!",
          icon:"warning",
          showCancelButton:true,
          confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        })
        if(result.isConfirmed){
          try {
            dispatch(start())
          const data = { salonId: salon._id, imageId,cloudinaryImageId };
          const response = await deleteImage(data);
          dispatch(deleteImageSalon(response.data.updatedSalonData))
        } catch (err:any) {
          console.error("Failed to delete image:", err);
          alert("Failed to delete image.");
          dispatch(stop(err.message))
        }
      };
    }
   

  return (
    <div>
      <div className="flex flex-col lg:flex-row">
        <SalonSidebar />
        <div className="flex-1">
          <SalonHeader />

          {/* Gallery Section */}
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-center lg:text-left">
              Salon Gallery
            </h1>

           {/* Spinner Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

            {/* Upload Form */}
            <form
              onSubmit={handleUpload}
              className="mb-4 flex flex-col sm:flex-row items-center gap-2"
            >
              <input
                type="file"
                onChange={(e:any) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                className="border p-2 rounded w-full sm:w-auto"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Upload
              </button>
            </form>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {salon.images.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">
                  No images uploaded yet.
                </p>
              ) : (
                salon.images.map((image: any, index: number) => (
                  <div
                    key={index}
                    className="relative group shadow-md rounded overflow-hidden"
                  >
                    <img
                      src={image.url}
                      alt={`Salon Image ${index + 1}`}
                      className="w-full h-full sm:h-40 md:h-56 object-cover"
                    />
                    <button
                      onClick={() => handleDelete(image._id,image.id)}
                      disabled={loading}
                      className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonGallery;
