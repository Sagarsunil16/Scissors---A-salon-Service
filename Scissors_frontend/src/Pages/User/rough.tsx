import { useState, useEffect } from 'react';
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useParams } from "react-router-dom";
import { getSalonDetails } from "../../Services/UserAPI";
import { FiPlus, FiCheck } from 'react-icons/fi';

interface Service {
  service: { $oid: string };
  name: string;
  description: string;
  price: number;
  _id: string ;
}

interface Image {
  id: string;
  url: string;
  _id: { $oid: string };
}

interface Address {
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
}

interface SalonData {
  salonName: string;
  email: string;
  phone: number;
  address: Address;
  openingTime: string;
  closingTime: string;
  images: Image[];
  services: Service[];
  rating: string;
  is_Active: boolean;
  verified: boolean;
}

const SalonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const response = await getSalonDetails(id!);
        setSalon(response.data.salonData);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch salon details');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!salon) return <div className="text-center py-8">Salon not found</div>;

  // Format time to AM/PM format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return hour >= 12 
      ? `${hour === 12 ? 12 : hour - 12}:${minutes} PM`
      : `${hour}:${minutes} AM`;
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = salon?.services.find(s => s._id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Salon Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{salon.salonName}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="flex items-center">
              ⭐ {salon.rating}/5
            </span>
            <span>•</span>
            <span>{salon.address.areaStreet}, {salon.address.city}</span>
            <span>•</span>
            <span className={`text-sm ${salon.is_Active ? 'text-green-600' : 'text-red-600'}`}>
              {salon.is_Active ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {salon.images.map((image, index) => (
            <img
              key={image._id.$oid}
              src={image.url}
              alt={`Salon ${index + 1}`}
              className="rounded-lg object-cover h-64 w-full shadow-md"
            />
          ))}
        </div>

        {/* Details Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Salon Information */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">About Us</h2>
            <div className="space-y-4 text-gray-600">
              <p className="flex items-center">
                🕒 Open Hours: {formatTime(salon.openingTime)} - {formatTime(salon.closingTime)}
              </p>
              <p className="flex items-center">
                📍 Address: {salon.address.areaStreet}, {salon.address.city}, {salon.address.state} - {salon.address.pincode}
              </p>
              <p className="flex items-center">
                📞 Contact: {salon.phone}
              </p>
              <p className="flex items-center">
                ✉️ Email: {salon.email}
              </p>
            </div>
          </div>

          {/* Services Section */}
         {/* Modified Services Section */}
      <div className="bg-white p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-2xl font-semibold mb-4">Services & Pricing</h2>
        <div className="space-y-4">
          {salon.services.map((service) => (
            <div 
              key={service._id}
              className="border-b pb-4 group relative"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-blue-600">₹{service.price}</span>
                  <button
                    onClick={() => toggleService(service._id)}
                    className={`p-2 rounded-full transition-colors ${
                      selectedServices.includes(service._id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {selectedServices.includes(service._id) ? (
                      <FiCheck className="w-5 h-5" />
                    ) : (
                      <FiPlus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Continue Section */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg">Selected Services</h3>
                <p className="text-gray-500 text-sm">
                  {selectedServices.length} services selected - 
                  Total: ₹{calculateTotal()}
                </p>
              </div>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg
                         hover:bg-blue-700 transition-colors"
              >
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SalonDetails;