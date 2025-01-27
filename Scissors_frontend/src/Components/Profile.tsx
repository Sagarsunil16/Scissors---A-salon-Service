import { useSelector } from "react-redux";
import ProfileNavbar from "./ProfileNavbar";

const UserProfile = () => {
  const user = useSelector((state: any) => state.user.currentUser);

  return (       
    <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center">
      {/* User Info Section */}
      <div className="bg-white w-full max-w-3xl p-6 text-center mb-6 mt-10">
          <h1 className="text-2xl font-semibold mb-2 font-manrope">HELLO, {user?.firstname.toUpperCase() || "User Name"}</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        <ProfileNavbar/>
        {/* Additional User Details Section */}
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 mt-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Profile Details</h2>
        <div className="grid grid-cols-2 gap-4 text-left justify-center items-center">
         
          <div>
            <p className="text-gray-600 font-medium">Name:</p>
            <p className="text-gray-800">{user?.firstname +" "+ user.lastname || "Not Provided"}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Phone:</p>
            <p className="text-gray-800">{user?.phone || "Not Provided"}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Email:</p>
            <p className="text-gray-800">{user?.email || "Not Provided"}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Address:</p>
            <p className="text-gray-800">{user.address.areaStreeet!==null? user.address.city : "Not Provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
