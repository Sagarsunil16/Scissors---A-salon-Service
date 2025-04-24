import { useState, useEffect } from "react";
import moment from 'moment-timezone'
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getAvailableSlot,
  fetchServiceStylist,
  getSalonDetailsWithSlots,
  getSalonReviews,
} from "../../Services/UserAPI";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Card, CardContent } from "../../Components/ui/card";
import { start } from "../../Redux/Salon/salonSlice";
import { Star } from "lucide-react";

interface Service {
  service: { $oid: string };
  name: string;
  description: string;
  price: number;
  _id: string;
}

interface Image {
  id: string;
  url: string;
  _id: string;
}

interface Address {
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
}

interface Review{
  _id:string,
  userId:{firstname:string,lastname:string},
  stylistId:{name:string},
  salonRating: number;
  salonComment: string;
  stylistRating: number;
  stylistComment: string;
  createdAt: string;
}

interface SalonData {
  _id:string
  salonName: string;
  email: string;
  phone: number;
  address: Address;
  openingTime: string;
  closingTime: string;
  images: Image[];
  services: Service[];
  rating: number;
  reviewCount:number;
  is_Active: boolean;
  verified: boolean;
  timeZone:string
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  return hour >= 12
    ? `${hour === 12 ? 12 : hour - 12}:${minutes} PM`
    : `${hours}:${minutes} AM`;
};

const formatTimeInSalon = (utcTime:string,timezone:string)=>{
  return moment.utc(utcTime).tz(timezone).format('h:mm A')
}

const SalonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {currentUser} =  useSelector((state:any)=>state.user)
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visibleServices, setVisibleServices] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [serviceOption, setServiceOption] = useState<'home' | 'store'>('store');
  const [selectedAddress, setSelectedAddress] = useState<string>(''); // State for address
  console.log(selectedServices, "selectedServices");

  const [stylists, setStylists] = useState<any[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<
    { _id:string, startTime: string; endTime: string }[]
  >([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotId,setSelectedSlotId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const navigate = useNavigate()

  console.log(availableSlots,"AvailableSlots")
  useEffect(() => {
    const fetchStylists = async () => {
      if (selectedServices.length > 0 && id) {
        console.log("entering in the try of fetch stylist");
        try {
          const response = await fetchServiceStylist({
            salonId: id,
            serviceIds: selectedServices,
          });
          console.log(response,"stylists")
          setStylists(response.data.stylists);
          setSelectedStylist(null);
        } catch (error) {
          console.error("Error fetching stylists:", error);
        }
      }
    };
    fetchStylists();
  }, [selectedServices, id]);

  useEffect(() => {
    const fetchSalonData = async () => {
      setSlotLoading(true);
      try {
        if (!id) return;
        const serviceId = selectedServices[0];
        const data = {
          id,
          serviceId,
          stylistId: selectedStylist as string,
          selectedDate,
        };
        const [salonResponse] = await Promise.all([getSalonDetailsWithSlots(data)])
        console.log(salonResponse,"Both");
        setSalon(salonResponse.data.salonData);
        setAvailableSlots(salonResponse.data.availableSlots || []);
        setReviews(salonResponse.data.reviews)
      } catch (error: any) {
        setError(error.message || "Failed to fetch salon details");
      } finally {
        setLoading(false);
        setSlotLoading(false);
      }
    };
    fetchSalonData();
  }, [id, selectedDate, selectedServices, selectedStylist]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!salon) return <div className="text-center py-8">Salon not found</div>;

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  const toggleVisibleServices = () => {
    setVisibleServices((prev) => (prev === 3 ? salon.services.length : 3));
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = salon?.services.find((s) => s._id === serviceId);

      return total + (service?.price || 0);
    }, 0);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split("T")[0];
  };
  const isAddressValid = () => {
    const { areaStreet, city, state, pincode } = currentUser.address;
    return areaStreet && city && state && pincode; // Check if all fields are non-null
  };

  const renderStars = (rating:number)=>{
    const stars = []
    for(let i=1;i<=5;i++){
      stars.push(
        <Star
        key={i}
        className={`w-4 h-4 inline-block mr-1 ${
          i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
        />
      )
    }
    return stars
  }
  return (
    <div className=" bg-gray-50">
      <Navbar />
      <main className=" min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg-px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 pt-12">
            {salon.salonName}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
          <span className="flex items-center">⭐ {salon.rating.toFixed(1)} ({salon.reviewCount} reviews)</span>
            <span>•</span>
            <span>
              {salon.address.areaStreet}, {salon.address.city}
            </span>
            <span
              className={`text-sm ${
                salon.is_Active ? "text-green-600" : "text-red-600"
              }`}
            >
              {salon.is_Active ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {salon.images.map((image, index) => (
            <img
              key={image._id}
              src={image.url}
              alt={`Salon ${index + 1}`}
              className="rounded-lg object-cover h-64 w-full shadow-md"
            />
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">About Us</h2>
            <div className="space-y-4 text-gray-600">
              <p className="flex items-center">
                🕙 Open Hours: {formatTime(salon.openingTime)} -{" "}
                {formatTime(salon.closingTime)}
              </p>
              <p className="flex items-center">
                📍 Address: {salon.address.areaStreet}, {salon.address.city},{" "}
                {salon.address.state} - {salon.address.pincode}
              </p>
              <p className="flex items-center">📞 Contact: {salon.phone}</p>
              <p className="flex items-center">✉️ Email: {salon.email}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md h-fit">
            <h2 className="text-2xl font-semibold mb-4">Services & Pricing</h2>
            <div className="space-y-4">
              {salon.services.slice(0, visibleServices).map((service) => (
                <div key={service._id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-1">
                      <span className="text-blue-600">₹{service.price}</span>
                      <button
                        onClick={() => toggleService(service._id)}
                        className={`p-2 rounded-full transition-colors ${
                          selectedServices.includes(service._id)
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
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

              {salon.services.length > 3 && (
                <button
                  onClick={toggleVisibleServices}
                  className="text-blue-600 font-semibold mt-4"
                >
                  {visibleServices === 3 ? "Show More ▼" : "Show Less ▲"}
                </button>
              )}
            </div>
          </div>
          {/* Sticky Continue Section */}

          {/* Update the Continue to Booking section */}
          {selectedServices.length > 0 && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Booking Summary (Left Side) */}
        <div>
          <h3 className="font-medium text-lg">Booking Summary</h3>
          <div className="text-sm text-gray-500">
            <p>Services: {selectedServices.length}</p>
            {selectedStylist && (
              <p>
                Stylist:{" "}
                {stylists.find((s) => s._id === selectedStylist)?.name}
              </p>
            )}
            {selectedSlot && (
              <p>
                {new Date(selectedSlot).toLocaleDateString()} -{" "}
                {new Date(selectedSlot).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            )}
            <p className="mt-1 font-semibold">Total: ₹{calculateTotal()}</p>
          </div>
        </div>

        {/* Payment Method and Service Option (Right Side) */}
        <div className="flex items-center  gap-4">
          

          {/* Service Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Option
            </label>
            <select
              value={serviceOption}
              onChange={(e) => setServiceOption(e.target.value as 'home' | 'store')}
              className="mt-1 p-2 border rounded-lg w-full"
            >
              <option value="store">Store</option>
              <option value="home">Home</option>
            </select>
          </div>

          {/* Book Now Button */}
          <button
            onClick={() => {
              if (!selectedStylist) {
                alert("Please select a stylist");
              }if (!selectedSlot) {
                alert("Please select a time slot");
              }
              if (serviceOption === 'home' && !isAddressValid()) {
                alert("Please add your address to proceed with home service");
                navigate("/profile"); // Navigate to profile page to add/update address
                return 
              }
              const stylistName = stylists.find((stylist)=>stylist._id === selectedStylist)?.name || ""
              console.log(stylistName,"stylist namesdas")
              const serviceNames = selectedServices.map((ServiceId)=>{
              const service =  salon?.services.find((s)=>s._id === ServiceId)
              return service?.name
              }).filter(Boolean)
              navigate(`/salons/${salon.salonName}/book`, {
                state: {
                  user:currentUser._id,
                  salon:salon._id,
                  selectedServices,
                  selectedSlot,
                  slotId:selectedSlotId,
                  selectedDate,
                  selectedStylist,
                  stylistName,
                  serviceNames,
                  serviceOption,
                  totalPrice:calculateTotal(),
                  selectedAddress: serviceOption === 'home' ? currentUser.address : null, // Pass address only for home service
                },
              });
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4"
          >
           Book Now
          </button>
  
        </div>
      </div>
    </div>
  </div>
)}
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md mt-8">
          <h2 className="text-2xl font-semibold mb-4">Select Date</h2>
          <input
            type="date"
            value={selectedDate}
            min={getMinDate()}
            max={getMaxDate()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-lg w-full"
          />
        </div>

        {selectedServices.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md mt-8">
            <h3 className="text-lg font-semibold mb-4">Select Stylist</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stylists &&
                stylists.map((stylist) => (
                  <button
                    key={stylist._id}
                    onClick={() => {
                      setSelectedStylist(stylist._id);
                      setSelectedSlot(null); // Reset slot selection
                    }}
                    className={`p-3 rounded-lg transition-colors ${
                      selectedStylist === stylist._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <p className="font-medium">{stylist.name}</p>
                    <p className="text-sm text-gray-500">
                    {stylist.rating === 0 ? 'No ratings yet' : `${stylist.rating}/5 stars`}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}
        {/* Available Slots Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
  <h2 className="text-2xl font-semibold mb-4">Available Slots</h2>
  {slotLoading ? (
    <div className="text-center py-4">Loading slots...</div>
  ) : (
    <div className="flex flex-wrap gap-2">
      {availableSlots.length > 0 ? (
        availableSlots.map((slot) => (
          <button
            key={`${slot.startTime}-${slot.endTime}`}
            onClick={() => {setSelectedSlot(slot.startTime); setSelectedSlotId(slot._id)}}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedSlot === slot.startTime
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {formatTimeInSalon(slot.startTime, salon.timeZone)} -{" "}
            {formatTimeInSalon(slot.endTime, salon.timeZone)}
          </button>
        ))
      ) : (
        <p className="text-gray-500">
          {selectedServices.length === 0
            ? "Select a service to view slots"
            : "No slots available for selected date"}
        </p>
      )}
    </div>
  )}
</div>

        {/* Feedback & Reviews Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
  <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
  
  {reviews.length > 0 ? (
    <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
      {reviews.map((review) => (
        <Card key={review._id} className="border border-gray-200 rounded-lg shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">
                {review.userId?.firstname} {review.userId?.lastname}
              </p>
              <span className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2">
              {/* <p className="text-sm font-semibold text-gray-800">Salon Rating</p> */}
              <div>{renderStars(review.salonRating)}</div>
              <p className="text-sm text-gray-700 mt-1">{review.salonComment}</p>
            </div>
            {/* <div className="mt-4">
              <p className="text-sm font-semibold text-gray-800">
                Stylist: {review.stylistId?.name || "Unknown"}
              </p>
              <div>{renderStars(review.stylistRating)}</div>
              <p className="text-sm text-gray-700 mt-1">{review.stylistComment}</p>
            </div> */}
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">No reviews yet. Book an appointment to share your experience!</p>
  )}
</div>

      </main>
      <Footer />
    </div>
  );
};

export default SalonDetails;
