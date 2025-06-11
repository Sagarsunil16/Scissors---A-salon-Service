import { useEffect, useState } from 'react';
import SalonSidebar from '../../Components/SalonSidebar';
import SalonHeader from '../../Components/SalonHeader';
import { cancelAppointment, completeAppointment, getAppointments } from '../../Services/salonAPI';
import ReusableTable, { Column } from '../../Components/ReusableTable';
import moment from 'moment-timezone';

interface Address {
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
}

interface Service {
  _id: string;
  name: string;
  duration: number;
  price?: number;
}

interface SalonService extends Service {
  service?: string; // ObjectId in salon.services
  description?: string;
  stylists?: string[];
  timeZone?: string;
}

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  formattedDate?: string;
  formattedTime?: string;
}

interface Appointment {
  _id: string;
  user: { firstname: string; lastname: string; email: string; phone: string, address:{areaStreet:string,city:string,state:string,pincode:string} };
  stylist: { name: string };
  services: Service[];
  slots: Slot[];
  status: string;
  totalPrice: number;
  serviceOption:string
  salon: {
    _id: string;
    salonName: string;
    address: Address;
    timeZone?: string;
    services: SalonService[];
  };
}

const SalonBookings = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;

  const fetchAppointments = async (status: string = 'all', search: string = '', page: number = 1) => {
    setLoading(true);
    try {
      const response = await getAppointments(page, itemsPerPage, status, search);
      const { appointments, total } = response.data.data;
      console.log('fetchAppointments Response:', { response, total, appointments });
      const enriched = enrichAppointments(appointments);
      setAppointments(enriched);
      setTotalItems(total);
    } catch (error) {
      alert('Failed to fetch appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      await cancelAppointment(appointment._id);
      alert('Appointment cancelled successfully');
      fetchAppointments(selectedStatus, searchQuery, currentPage);
    } catch (error) {
      alert('Failed to cancel appointment');
      console.error(error);
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    try {
      await completeAppointment(appointment._id);
      alert('Appointment marked as completed');
      fetchAppointments(selectedStatus, searchQuery, currentPage);
    } catch (error) {
      alert('Failed to mark appointment as completed');
      console.error(error);
    }
  };

  const enrichAppointments = (appointments: Appointment[]) => {
    return appointments.map((appointment) => {
      const salonServices = appointment.salon?.services || [];
      const enrichedServices = Array.isArray(appointment.services)
        ? appointment.services.map((service) => {
            if (typeof service === 'string') {
              const salonService = salonServices.find(
                (s) => s._id === service || s.service === service
              );
              return salonService
                ? {
                    _id: salonService._id,
                    name: salonService.name,
                    duration: salonService.duration,
                    price: salonService.price,
                  }
                : { _id: service, name: 'Unknown Service', duration: 0, price: 0 };
            }
            return service;
          }).filter(Boolean)
        : [];
      return { ...appointment, services: enrichedServices };
    });
  };

  // Format slots for display (use earliest slot or combine)
  const formatSlotTimeRange = (slots: Slot[], timeZone: string = 'Asia/Kolkata') => {
    if (!slots || slots.length === 0) return { date: 'N/A', time: 'N/A' };
    const sortedSlots = [...slots].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    const start = moment.utc(sortedSlots[0].startTime).tz(timeZone);
    const end = moment.utc(sortedSlots[sortedSlots.length - 1].endTime).tz(timeZone);
    return {
      date: start.format('MMMM Do YYYY'),
      time: `${start.format('h:mm a')} - ${end.format('h:mm a')}`,
    };
  };

  useEffect(() => {
    console.log('useEffect Triggered:', { selectedStatus, searchQuery, currentPage });
    fetchAppointments(selectedStatus, searchQuery, currentPage);
  }, [selectedStatus, searchQuery, currentPage]);

  const columns: Column<Appointment>[] = [
    {
      header: 'Customer',
      accessor: 'user',
      minWidth: '120px',
      render: (item: Appointment) => `${item.user.firstname} ${item.user.lastname}`,
    },
    {
      header: 'Contact',
      accessor: 'user',
      minWidth: '150px',
      render: (item: Appointment) => (
        <div>
          <div className="text-sm">{item.user.phone}</div>
          {item.serviceOption === 'home' && item.user.address && (
            <div className="text-xs text-gray-500 mt-1">
              {[
                item.user.address.areaStreet,
                item.user.address.city,
                item.user.address.state,
                item.user.address.pincode
              ].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Stylist',
      accessor: 'stylist',
      minWidth: '100px',
      render: (item: Appointment) => item.stylist?.name || '',
    },
    {
      header: 'Services',
      accessor: 'services',
      minWidth: '150px',
      render: (item: Appointment) =>
        item.services.length > 0 ? item.services.map((s) => s.name).join(', ') : 'N/A',
    },
    {
      header: 'Date',
      accessor: 'slots',
      minWidth: '100px',
      render: (item: Appointment) => formatSlotTimeRange(item.slots, item.salon?.timeZone).date,
    },
    {
      header: 'Time',
      accessor: 'slots',
      minWidth: '100px',
      render: (item: Appointment) => formatSlotTimeRange(item.slots, item.salon?.timeZone).time,
    },
    {
      header: 'Status',
      accessor: 'status',
      minWidth: '100px',
    },
    {
      header: 'Total Price',
      accessor: 'totalPrice',
      minWidth: '100px',
      render: (item: Appointment) => `Rs ${item.totalPrice.toFixed(2)}`,
    },
  ];

  const actions = [
    {
      label: 'Cancel',
      onClick: handleCancel,
      className:
        'w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed',
      disabled: (item: Appointment) => item.status === 'cancelled' || item.status === 'completed',
    },
    {
      label: 'Complete',
      onClick: handleComplete,
      className:
        'w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed',
      disabled: (item: Appointment) => item.status === 'completed' || item.status === 'cancelled',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white md:flex-row">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-4 sm:p-6 flex-1 overflow-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Salon Bookings</h2>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
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

          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <ReusableTable<Appointment>
              columns={columns}
              data={appointments}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              loading={loading}
              searchQuery={searchQuery}
              editingId={null}
              editForm={{}}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onPageChange={(page) => {
                console.log('SalonBookings onPageChange:', page);
                setCurrentPage(page);
              }}
              actions={actions}
              getRowId={(item: Appointment) => item._id}
            />
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs bg-gray-50 rounded-md">
                No appointments found
              </div>
            ) : (
              appointments.map((appointment) => {
                const { date, time } = formatSlotTimeRange(appointment.slots, appointment.salon?.timeZone);
                return (
                  <div
                    key={appointment._id}
                    className="bg-white p-4 rounded-md shadow-sm border border-gray-200"
                  >
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-xs">Customer:</span>{' '}
                        {`${appointment.user.firstname} ${appointment.user.lastname}`}
                      </div>
                      <div>
                        <span className="font-semibold text-xs">Phone:</span>{' '}
                        {appointment.user.phone}
                      </div>
                      {appointment.serviceOption === 'home' && appointment.user.address && (
                        <div>
                          <span className="font-semibold text-xs">Address:</span>{' '}
                          {[
                            appointment.user.address.areaStreet,
                            appointment.user.address.city,
                            appointment.user.address.state,
                            appointment.user.address.pincode
                          ].filter(Boolean).join(', ')}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-xs">Stylist:</span>{' '}
                        {appointment.stylist?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold text-xs">Services:</span>{' '}
                        {appointment.services.length > 0
                          ? appointment.services.map((s) => s.name).join(', ')
                          : 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold text-xs">Date:</span> {date}
                      </div>
                      <div>
                        <span className="font-semibold text-xs">Time:</span> {time}
                      </div>
                      <div>
                        <span className="font-semibold text-xs">Status:</span> {appointment.status}
                      </div>
                      <div>
                        <span className="font-semibold text-xs">Total Price:</span> Rs{' '}
                        {appointment.totalPrice.toFixed(2)}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => handleCancel(appointment)}
                          disabled={
                            appointment.status === 'cancelled' || appointment.status === 'completed'
                          }
                          className={`px-2 py-1 rounded-md text-xs text-indigo-600 hover:text-indigo-900 ${
                            appointment.status === 'cancelled' || appointment.status === 'completed'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleComplete(appointment)}
                          disabled={
                            appointment.status === 'completed' || appointment.status === 'cancelled'
                          }
                          className={`px-2 py-1 rounded-md text-xs text-red-600 hover:text-red-900 ${
                            appointment.status === 'completed' || appointment.status === 'cancelled'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonBookings;