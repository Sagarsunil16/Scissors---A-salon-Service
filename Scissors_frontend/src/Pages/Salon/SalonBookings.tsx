import { useEffect, useState } from 'react';
import SalonSidebar from '../../Components/SalonSidebar';
import SalonHeader from '../../Components/SalonHeader';
import { cancelAppointment, completeAppointment, getAppointments } from '../../Services/salonAPI';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchAppointments = async (status: string = 'all', search: string = '', page: number = 1) => {
    setLoading(true);
    try {
      const response = await getAppointments(page,itemsPerPage,status,search)
      
      // await axios.get('http://localhost:3000/salon/appointments', {
      //   params: {
      //     ...(status !== 'all' && { status }),
      //     ...(search && { search }),
      //     page,
      //     limit: itemsPerPage,
      //   },
      //   withCredentials: true,
      // });
      const { appointments, pages } = response.data.data;
      console.log(response,"response")
      const enriched = enrichAppointments(appointments, appointments[0]?.salon?.services || []);
      setAppointments(enriched);
      setTotalItems(pages);
    } catch (error) {
      alert('Failed to fetch appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      alert('Appointment cancelled successfully');
      fetchAppointments(selectedStatus, searchQuery, currentPage);
    } catch (error) {
      alert('Failed to cancel appointment');
      console.error(error);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    try {
      await completeAppointment(appointmentId);
      alert('Appointment marked as completed');
      fetchAppointments(selectedStatus, searchQuery, currentPage);
    } catch (error) {
      alert('Failed to mark appointment as completed');
      console.error(error);
    }
  };

  const enrichAppointments = (appointments: Appointment[], salonServicesMap: any[]) => {
    return appointments.map((appointment) => {
      const enrichedServices = appointment.services.map((serviceId: any) => {
        return salonServicesMap.find((s: any) => s._id === serviceId);
      }).filter(Boolean);
      return { ...appointment, services: enrichedServices };
    });
  };

  useEffect(() => {
    fetchAppointments(selectedStatus, searchQuery, currentPage);
  }, [selectedStatus, searchQuery, currentPage]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-4 sm:p-6 flex-1 overflow-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Salon Bookings</h2>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name or email"
                className="w-full px-2 py-2 sm:px-3 sm:py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                id="statusFilter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2 py-2 sm:px-3 sm:py-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200 hidden sm:table">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Customer</th>
                    <th className="py-2 px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Stylist</th>
                    <th className="py-2 px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Services</th>
                    <th className="py-2 px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Date</th>
                    <th className="py-2 px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Time</th>
                    <th className="py-2 px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-2 px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Total Price</th>
                    <th className="py-2 px-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 px-4 text-center text-gray-500 text-xs sm:text-sm bg-gray-50">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => (
                      <tr key={appointment._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 text-xs sm:text-sm">{`${appointment.user.firstname} ${appointment.user.lastname}`}</td>
                        <td className="py-2 px-4 text-xs sm:text-sm">{appointment.stylist.name}</td>
                        <td className="py-2 px-4 text-xs sm:text-sm">{appointment.services.map((s) => s.name).join(', ')}</td>
                        <td className="py-2 px-4 text-xs sm:text-sm">{appointment.slot.formattedDate}</td>
                        <td className="py-2 px-4 text-xs sm:text-sm">{appointment.slot.formattedTime}</td>
                        <td className="py-2 px-4 text-xs sm:text-sm">{appointment.status}</td>
                        <td className="py-2 px-4 text-xs sm:text-sm">Rs:{appointment.totalPrice.toFixed(2)}</td>
                        <td className="py-2 px-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCancel(appointment._id)}
                            disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md text-white text-xs sm:text-sm ${
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
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md text-white text-xs sm:text-sm ${
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

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-4">
                {appointments.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-xs bg-gray-50 rounded-md">
                    No appointments found
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment._id} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-xs">Customer:</span> {`${appointment.user.firstname} ${appointment.user.lastname}`}
                        </div>
                        <div>
                          <span className="font-semibold text-xs">Stylist:</span> {appointment.stylist.name}
                        </div>
                        <div>
                          <span className="font-semibold text-xs">Services:</span> {appointment.services.map((s) => s.name).join(', ')}
                        </div>
                        <div>
                          <span className="font-semibold text-xs">Date:</span> {appointment.slot.formattedDate}
                        </div>
                        <div>
                          <span className="font-semibold text-xs">Time:</span> {appointment.slot.formattedTime}
                        </div>
                        <div>
                          <span className="font-semibold text-xs">Status:</span> {appointment.status}
                        </div>
                        <div>
                          <span className="font-semibold text-xs">Total Price:</span> Rs:{appointment.totalPrice.toFixed(2)}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={() => handleCancel(appointment._id)}
                            disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
                            className={`px-2 py-1 rounded-md text-white text-xs ${
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
                            className={`px-2 py-1 rounded-md text-white text-xs ${
                              appointment.status === 'completed' || appointment.status === 'cancelled'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <div className="my-4 sm:my-6">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonBookings;