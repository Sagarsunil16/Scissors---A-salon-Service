import { useEffect, useState } from 'react';
import axios from 'axios';
import SalonSidebar from '../../Components/SalonSidebar';
import SalonHeader from '../../Components/SalonHeader';
import { cancelAppointment, completeAppointment } from '../../Services/salonAPI';
import Pagination from '../../Components/Pagination';


interface Appointment {
  _id: string;
  user: { firstname: string; lastname: string; email: string; phone: string };
  stylist: { name: string };
  services: { name: string; duration: number }[];
  slot: { startTime: string; endTime: string; formattedDate: string; formattedTime: string };
  status: string;
  totalPrice: number;
}

const SalonBookings = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage,setCurrentPage] = useState(1)

  const fetchAppointments = async (status: string = 'all') => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/salon/appointments', {
        params: status !== 'all' ? { status } : undefined, // Only send status if filtering
        withCredentials: true,
      });
      const { data } = response.data;
      console.log(data,"Appointment data")
      const enriched = enrichAppointments(data.appointments, data.appointments[0]?.salon?.services || []);
    setAppointments(enriched);
    } catch (error) {
      alert('Failed to fetch appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      const response = await cancelAppointment(appointmentId)
      console.log(response)
      alert('Appointment cancelled successfully');
      fetchAppointments(selectedStatus); 
    } catch (error) {
      alert('Failed to cancel appointment');
      console.error(error);
    }
  };


  const handleComplete = async (appointmentId: string) => {
    try {
     const response = await completeAppointment(appointmentId)
     console.log(response)
      alert('Appointment marked as completed');
      fetchAppointments(selectedStatus); 
    } catch (error) {
      alert('Failed to mark appointment as completed');
      console.error(error);
    }
  };

  const enrichAppointments = (appointments: Appointment[], salonServicesMap: any[]) => {
    return appointments.map((appointment) => {
      const enrichedServices = appointment.services.map((serviceId: any) => {
        // Find matching service object from salon.services
        return salonServicesMap.find((s: any) => s._id === serviceId);
      }).filter(Boolean); // Remove undefined if any serviceId doesn't match
  
      return {
        ...appointment,
        services: enrichedServices,
      };
    });
  };
  
  useEffect(() => {
    fetchAppointments(selectedStatus);
  }, [selectedStatus,currentPage]);

  return (
    <div className="flex h-screen">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-6 flex-1 overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Salon Bookings</h2>

          {/* Status Filter Dropdown */}
          <div className="mb-4">
            <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Stylist</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Services</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Total Price</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 px-4 text-center text-gray-500">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => (
                      <tr key={appointment._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{`${appointment.user.firstname} ${appointment.user.lastname}`}</td>
                        <td className="py-2 px-4">{appointment.stylist.name}</td>
                        <td className="py-2 px-4">
                          {appointment.services.map((s) => s.name).join(', ')}
                        </td>
                        <td className="py-2 px-4">{appointment.slot.formattedDate}</td>
                        <td className="py-2 px-4">{appointment.slot.formattedTime}</td>
                        <td className="py-2 px-4">{appointment.status}</td>
                        <td className="py-2 px-4">Rs:{appointment.totalPrice.toFixed(2)}</td>
                        <td className="py-2 px-4 flex space-x-2">
                          <button
                            onClick={() => handleCancel(appointment._id)}
                            disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
                            className={`py-1 px-3 rounded text-white ${
                              appointment.status === 'cancelled' || appointment.status === 'completed'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleComplete(appointment._id)}
                            disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                            className={`py-1 px-3 rounded text-white ${
                              appointment.status === 'completed' || appointment.status === 'cancelled'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            Complete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="my-6">
            <Pagination
              currentPage={currentPage}
              totalItems={10}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
            />
          </div>
      </div>
    </div>
  );
};

export default SalonBookings;