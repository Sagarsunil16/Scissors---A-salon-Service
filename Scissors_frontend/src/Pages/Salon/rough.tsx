import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStylistById, updateStylist } from "../../Services/salonAPI";
import { IStylist, WorkingHours } from "../../interfaces/interface";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import { toast } from "react-toastify";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EditStylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stylist, setStylist] = useState<IStylist | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStylist = async () => {
      try {
        const response = await getStylistById(id as string);
        const stylistData = response.data.result;
        setStylist(stylistData);
        setName(stylistData.name);
        setEmail(stylistData.email);
        setPhone(stylistData.phone);
        setWorkingHours(stylistData.workingHours);
        setAvailable(stylistData.available);
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
    for (const [index, wh] of workingHours.entries()) {
      // Check for empty fields
      if (!wh.day || !wh.startTime || !wh.endTime) {
        toast.error("Please fill all fields in working hours");
        return false;
      }

      // Check duplicate days
      if (days.has(wh.day)) {
        toast.error(`Duplicate day found: ${wh.day}`);
        return false;
      }
      days.add(wh.day);

      // Check time order
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
        available,
        workingHours
      };
      await updateStylist(id as string, data);
      toast.success("Stylist updated successfully");
      navigate("/salon/stylists");
    } catch (error) {
      console.error("Error updating stylist:", error);
      toast.error("Failed to update stylist");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-6 max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Edit Stylist</h1>
              <button
                onClick={() => navigate("/salon/stylists")}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 234 567 890"
                      required
                    />
                  </div>
                </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-4">
                    {workingHours.map((wh, index) => (
                      <div key={index} className="border p-4 rounded-lg relative">
                        <button
                          type="button"
                          onClick={() => removeWorkingHours(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          disabled={workingHours.length === 1}
                        >
                          ×
                        </button>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Day <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={wh.day}
                              onChange={(e) => handleWorkingHoursChange(index, 'day', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select Day</option>
                              {daysOfWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="time"
                                value={wh.startTime}
                                onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="time"
                                value={wh.endTime}
                                onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addWorkingHours}
                      className="w-full py-2 text-blue-500 hover:text-blue-700 border border-dashed border-blue-200 rounded-lg"
                    >
                      + Add Another Day
                    </button>
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={available}
                          onChange={(e) => setAvailable(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${
                          available ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                            available ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Available for appointments
                      </span>
                    </label>
                  </div>
                </div>
              

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/salon/stylists")}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white hover:shadow-lg transition-all"
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