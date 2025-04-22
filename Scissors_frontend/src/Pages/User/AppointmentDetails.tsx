import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
// import ProfileDropdown from '../components/ProfileDropdown';
import Footer from '../../Components/Footer';

interface Service {
  _id: string;
  name: string;
  duration: number;
  price: number;
}

interface AppointmentDetails {
  _id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  salon: {
    name: string;
    address: string;
    contactNumber: string;
  };
  stylist: {
    name: string;
    specialization: string;
  };
  services: Service[];
  slot: {
    startTime: string;
    endTime: string;
    formattedDate: string;
    formattedTime: string;
  };
  status: string;
  totalPrice: number;
  totalDuration: number;
  paymentStatus: string;
  paymentMethod: string;
  serviceOption: string;
  formattedCreatedAt: string;
}

export const AppointmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dummy data - replace with your API call
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const dummyData: AppointmentDetails = {
          _id: id || '65a1b2c3d4e5f6g7h8i9j0k',
          user: {
            name: "John Doe",
            email: "john@example.com",
            phone: "+1234567890"
          },
          salon: {
            name: "Luxury Salon",
            address: "123 Beauty Street, New York, NY 10001",
            contactNumber: "+1 (212) 555-1234"
          },
          stylist: {
            name: "Jane Smith",
            specialization: "Hair Coloring Specialist"
          },
          services: [
            {
              _id: "1",
              name: "Hair Cut",
              duration: 30,
              price: 25
            },
            {
              _id: "2",
              name: "Hair Coloring",
              duration: 60,
              price: 50
            }
          ],
          slot: {
            startTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
            endTime: new Date(Date.now() + 86400000 * 2 + 5400000).toISOString(), // 1.5 hours later
            formattedDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            formattedTime: `${new Date(Date.now() + 86400000 * 2).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} - ${new Date(Date.now() + 86400000 * 2 + 5400000).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}`
          },
          status: "confirmed",
          totalPrice: 75,
          totalDuration: 90,
          paymentStatus: "paid",
          paymentMethod: "online",
          serviceOption: "store",
          formattedCreatedAt: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        setAppointment(dummyData);
      } catch (err) {
        setError('Failed to fetch appointment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Appointment Details</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              appointment?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              appointment?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {appointment?.status}
            </span>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Appointment Summary */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Salon</p>
                  <p className="font-medium">{appointment?.salon.name}</p>
                  <p className="text-sm text-gray-600">{appointment?.salon.address}</p>
                  <p className="text-sm text-gray-600">{appointment?.salon.contactNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stylist</p>
                  <p className="font-medium">{appointment?.stylist.name}</p>
                  <p className="text-sm text-gray-600">{appointment?.stylist.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{appointment?.slot.formattedDate}</p>
                  <p className="text-sm text-gray-600">{appointment?.slot.formattedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Option</p>
                  <p className="font-medium capitalize">{appointment?.serviceOption}</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Services</h2>
              <div className="space-y-4">
                {appointment?.services.map(service => (
                  <div key={service._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500">{service.duration} minutes</p>
                    </div>
                    <p className="font-medium">${service.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p>${appointment?.totalPrice}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Total Duration</p>
                  <p>{appointment?.totalDuration} minutes</p>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <p className="font-medium">Total</p>
                  <p className="font-medium">${appointment?.totalPrice}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Payment Method</p>
                  <p className="capitalize">{appointment?.paymentMethod}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Payment Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment?.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
              Reschedule
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AppointmentDetails;