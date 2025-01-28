import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";

const SalonDashboard = () => {
  return (
    <div>
      <div className="flex">
        <SalonSidebar/>
        <div className="flex-1 ">
            <SalonHeader/>
            <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">
            Welcome to the Salon Dashboard
          </h1>
          <p className="mt-4 text-gray-600">
            Use the navigation on the left to explore the dashboard features.
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}

export default SalonDashboard
