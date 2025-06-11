import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStylistById, updateStylist } from "../../Services/salonAPI";
import {  WorkingHours } from "../../interfaces/interface";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EditStylist = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const {salon} = useSelector((state:any)=>state.salon)
  console.log(salon,"salonData")

  useEffect(() => {
    const fetchStylist = async () => {
      try {
        const response = await getStylistById(id as string);
        const stylistData = response.data.result;
        setName(stylistData.name);
        setEmail(stylistData.email);
        setPhone(stylistData.phone);
        setWorkingHours(stylistData.workingHours);
        setIsAvailable(stylistData.isAvailable);
        
      } catch (error) {
        console.error("Error fetching stylist:", error);
        toast.error("Failed to load stylist data");
      } finally {
        setLoading(false);
      }
    };
    fetchStylist();
  }, [id]);

  

  const addWorkingHours = () => {
    setWorkingHours([...workingHours, { day: "", startTime: "", endTime: "" }]);
  };

  const removeWorkingHours = (index: number) => {
    const newHours = workingHours.filter((_, i) => i !== index);
    setWorkingHours(newHours);
  };

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHours, value: string) => {
    const newHours = [...workingHours];
    newHours[index][field] = value;
    setWorkingHours(newHours);
  };

  const validateWorkingHours = () => {
    const days = new Set<string>();
    for (const wh of workingHours) {
      if (!wh.day || !wh.startTime || !wh.endTime) {
        toast.error("Please fill all fields in working hours");
        return false;
      }
      if (days.has(wh.day)) {
        toast.error(`Duplicate day found: ${wh.day}`);
        return false;
      }
      days.add(wh.day);
      if (wh.startTime >= wh.endTime) {
        toast.error(`End time must be after start time for ${wh.day}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateWorkingHours()) return;

    try {
      const data = {
        name,
        email,
        phone,
        isAvailable,
        workingHours,
      };
      await updateStylist(id as string, data);
      toast.success("Stylist updated successfully");
      navigate("/salon/stylists");
    } catch (error) {
      console.error("Error updating stylist:", error);
      toast.error("Failed to update stylist");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SalonSidebar />
        <div className="flex-1 flex flex-col">
          <SalonHeader />
          <div className="p-3 sm:p-4 flex justify-center items-center h-full">
            <div className="text-gray-600 text-xs sm:text-sm">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="max-w-full sm:max-w-xl mx-auto bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Edit Stylist</h1>
              <button
                onClick={() => navigate("/salon/stylists")}
                className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Personal Information */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="+1 234 567 890"
                    required
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                  Working Hours
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {workingHours.map((wh, index) => (
                    <div key={index} className="border border-gray-100 p-2 sm:p-2.5 rounded-md relative">
                      <button
                        type="button"
                        onClick={() => removeWorkingHours(index)}
                        className="absolute top-0.5 right-0.5 text-red-500 hover:text-red-700 text-xs bg-red-50 rounded-full w-4 h-4 flex items-center justify-center"
                        disabled={workingHours.length === 1}
                      >
                        ×
                      </button>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Day <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={wh.day}
                            onChange={(e) => handleWorkingHoursChange(index, "day", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                            required
                          >
                            <option value="">Select Day</option>
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-1 sm:gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-0.5">
                              Start Time <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              value={wh.startTime}
                              onChange={(e) => handleWorkingHoursChange(index, "startTime", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-0.5">
                              End Time <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              value={wh.endTime}
                              onChange={(e) => handleWorkingHoursChange(index, "endTime", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addWorkingHours}
                  className="w-full py-1 text-blue-500 hover:text-blue-700 border border-dashed border-blue-100 rounded-md text-xs"
                >
                  + Add Another Day
                </button>
              </div>

              {/* Availability */}
              <div className="pt-3">
                <label className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-7 h-4 sm:w-8 sm:h-5 rounded-full transition-colors ${
                        isAvailable ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${
                          isAvailable ? "translate-x-3 sm:translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    Available for appointments
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => navigate("/salon/stylists")}
                  className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-colors text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStylist;