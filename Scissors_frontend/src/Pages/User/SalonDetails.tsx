import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAvailableSlot,
  fetchServiceStylist,
  getSalonDetails,
  createBooking,
  getWalletBalance,
} from "../../Services/UserAPI";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Card, CardContent } from "../../Components/ui/card";
import { Star } from "lucide-react";
import { Button } from "../../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { toast } from "react-toastify";

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  service: {
    _id: string;
    name: string;
  };
}

interface Image {
  id: string;
  url: string;
  _id: string;
}

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: number;
  serviceIds: { _id: string; name: string }[];
  expiryDate: string;
  isActive: boolean;
}

interface Address {
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
}

interface Review {
  _id: string;
  userId: { firstname: string; lastname: string };
  stylistId: { name: string };
  salonRating: number;
  salonComment: string;
  stylistRating: number;
  stylistComment: string;
  createdAt: string;
}

interface SalonData {
  _id: string;
  salonName: string;
  email: string;
  phone: number;
  address: Address;
  openingTime: string;
  closingTime: string;
  images: Image[];
  services: Service[];
  rating: number;
  reviewCount: number;
  is_Active: boolean;
  verified: boolean;
  timeZone: string;
}

interface SlotGroup {
  _id: string;
  slotIds: string[];
  startTime: string;
  endTime: string;
  duration: number;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  return hour >= 12
    ? `${hour === 12 ? 12 : hour - 12}:${minutes} PM`
    : `${hours}:${minutes} AM`;
};

const formatTimeInSalon = (utcTime: string, timezone: string) => {
  return moment.utc(utcTime).tz(timezone).format("h:mm A");
};

const SalonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useSelector((state: any) => state.user);
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [serviceOption, setServiceOption] = useState<"home" | "store">("store");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash" | "wallet">("online");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [slotGroups, setSlotGroups] = useState<SlotGroup[]>([]);
  const [selectedSlotGroup, setSelectedSlotGroup] = useState<SlotGroup | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalonData = async () => {
      setLoading(true);
      try {
        if (!id) throw new Error("Salon ID missing");
        const response = await getSalonDetails(id);
        setSalon(response.data.salonData);
        setReviews(response.data.reviews || []);
        setOffers(response.data.offers || []);
      } catch (error: any) {
        setError(error.message || "Failed to fetch salon details");
      } finally {
        setLoading(false);
      }
    };
    fetchSalonData();
  }, [id]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await getWalletBalance();
        setWalletBalance(response.data.data.balance);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
        setWalletBalance(0);
      }
    };
    if (selectedServices.length > 0) {
      fetchWalletBalance();
    }
  }, [selectedServices]);

  useEffect(() => {
    const fetchStylists = async () => {
      if (selectedServices.length > 0 && id) {
        try {
          const response = await fetchServiceStylist({
            salonId: id,
            serviceIds: selectedServices,
            date:selectedDate
          });
          setStylists(response.data.stylists);
          setSelectedStylist(null);
          setSlotGroups([]);
          setSelectedSlotGroup(null);
        } catch (error) {
          console.error("Error fetching stylists:", error);
        }
      } else {
        setStylists([]);
        setSelectedStylist(null);
        setSlotGroups([]);
        setSelectedSlotGroup(null);
      }
    };
    fetchStylists();
  }, [selectedDate, id, selectedServices]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedServices.length > 0 && selectedStylist && id) {
        setSlotLoading(true);
        try {
          const response = await getAvailableSlot({
            salonId: id,
            stylistId: selectedStylist,
            serviceIds: selectedServices,
            selectedDate,
          });
          setSlotGroups(response.data.slotGroups || []);
          setTotalDuration(response.data.totalDuration || 0);
        } catch (error: any) {
          setError(error.message || "Failed to fetch available slots");
        } finally {
          setSlotLoading(false);
        }
      } else {
        setSlotGroups([]);
        setTotalDuration(0);
      }
    };
    fetchAvailableSlots();
  }, [id, selectedStylist, selectedServices, selectedDate]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!salon) return <div className="text-center py-8">Salon not found</div>;

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
    setSelectedStylist(null);
    setSelectedSlotGroup(null);
  };

  const calculateTotal = () => {
    let total = selectedServices.reduce((sum, serviceId) => {
      const service = salon?.services.find((s) => s._id === serviceId);
      if (!service) return sum;
      const offers = getServiceOffers(service.service._id); // Use service.service._id
      const maxDiscount =
        offers.length > 0 ? Math.max(...offers.map((o) => o.discount), 0) : 0;
      const discountedPrice = service.price * (1 - maxDiscount / 100);
      return sum + discountedPrice;
    }, 0);
    if (serviceOption === "home") {
      total += 99;
    }
    return total;
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
    const { areaStreet, city, state, pincode } = currentUser.address || {};
    return areaStreet && city && state && pincode;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 inline-block mr-1 ${
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const getServiceOffers = (serviceId: string) => {
    return offers.filter(
      (offer) =>
        offer.isActive &&
        new Date(offer.expiryDate) >= new Date() &&
        (offer.serviceIds.length === 0 ||
          offer.serviceIds.some((s) => s._id === serviceId))
    );
  };

  const handleBookNow = async () => {
    if (bookingLoading) return;
    if (!selectedStylist) {
      toast.error("Please select a stylist");
      return;
    }
    if (!selectedSlotGroup) {
      toast.error("Please select a time slot");
      return;
    }
    if (serviceOption === "home" && !isAddressValid()) {
      toast.error("Please add your address to proceed with home service");
      navigate("/profile");
      return;
    }

    setBookingLoading(true);
    const finalAmount = calculateTotal();

    if (paymentMethod === "wallet") {
      if (walletBalance === null || walletBalance < finalAmount) {
        toast.error("Insufficient wallet balance");
        setBookingLoading(false);
        return;
      }

      try {
          await createBooking({
          salonId: id!,
          stylistId: selectedStylist,
          serviceIds: selectedServices,
          slotIds: selectedSlotGroup.slotIds,
          startTime: selectedSlotGroup.startTime,
          endTime: selectedSlotGroup.endTime,
          paymentMethod: "wallet",
          serviceOption,
          address: serviceOption === "home" ? currentUser.address : undefined,
        });
        toast.success("Booking confirmed successfully!");
        navigate("/appointments");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to book appointment");
        setError(error.response?.data?.message || "Failed to book appointment");
      } finally {
        setBookingLoading(false);
      }
      return;
    }

    try {
      const bookingResponse = await createBooking({
        salonId: id!,
        stylistId: selectedStylist,
        serviceIds: selectedServices,
        slotIds: selectedSlotGroup.slotIds,
        startTime: selectedSlotGroup.startTime,
        endTime: selectedSlotGroup.endTime,
        paymentMethod,
        serviceOption,
        address: serviceOption === "home" ? currentUser.address : undefined,
      });

      const { reservation } = bookingResponse.data;

      const stylistName = stylists.find((stylist) => stylist._id === selectedStylist)?.name || "";
      const serviceNames = selectedServices
        .map((serviceId) => salon?.services.find((s) => s._id === serviceId)?.name)
        .filter(Boolean);

      navigate(`/salons/${salon._id}/book`, {
        state: {
          user: currentUser._id,
          salonId: salon._id,
          selectedServices,
          slotIds: selectedSlotGroup.slotIds,
          startTime: selectedSlotGroup.startTime,
          endTime: selectedSlotGroup.endTime,
          selectedStylist,
          stylistName,
          serviceNames,
          serviceOption,
          totalPrice: finalAmount,
          totalDuration,
          reservedUntil: reservation.reservedUntil,
          bookingId: reservation.bookingId,
          appointmentId: reservation.appointmentId,
          timeZone: salon.timeZone,
          paymentMethod,
          selectedAddress: serviceOption === "home" ? currentUser.address : null,
        },
      });
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to reserve slots");
      toast.error(error.response?.data?.message || "Failed to reserve slots");
      if (error.response?.data?.message.includes("slot")) {
        setSelectedSlotGroup(null);
        setSlotGroups([]);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <Navbar />
      <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 pt-12">
            {salon.salonName}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="flex items-center">
              ⭐ {salon.rating.toFixed(1)} ({salon.reviewCount} reviews)
            </span>
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
  <div className="max-h-[200px] overflow-y-auto space-y-4 pr-2">
    {salon.services.map((service) => (
      <div key={service._id} className="border-b pb-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{service.name}</h3>
            <p className="text-gray-500 text-sm mt-1">
              {service.description} ({service.duration} min)
            </p>
            {getServiceOffers(service.service._id).map((offer) => (
              <div key={offer._id} className="mt-2 text-sm text-green-600">
                <p>
                  <strong>{offer.title}:</strong> {offer.discount}% off (Expires:{" "}
                  {new Date(offer.expiryDate).toLocaleDateString()})
                </p>
                <p className="text-gray-600">{offer.description}</p>
              </div>
            ))}
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
  </div>
</div>

          {selectedServices.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">Booking Summary</h3>
                    <div className="text-sm text-gray-500">
                      {selectedServices.map((serviceId) => {
                        const service = salon?.services.find((s) => s._id === serviceId);
                        if (!service) return null;
                        const offers = getServiceOffers(service.service._id);
                        const maxDiscount = offers.length > 0 ? Math.max(...offers.map((o) => o.discount), 0) : 0;
                        const discountedPrice = service.price * (1 - maxDiscount / 100);
                        const appliedOffer = offers.find((o) => o.discount === maxDiscount);
                        return (
                          <div key={service._id} className="mt-1">
                            <p>{service.name} ({service.duration} min)</p>
                            {maxDiscount > 0 ? (
                              <p>
                                Original: ₹{service.price}, {maxDiscount}% off (
                                {appliedOffer?.title}) → ₹{discountedPrice.toFixed(2)}
                              </p>
                            ) : (
                              <p>Price: ₹{service.price}</p>
                            )}
                          </div>
                        );
                      })}
                      <p>Total Duration: {totalDuration} minutes</p>
                      {selectedStylist && (
                        <p>
                          Stylist: {stylists.find((s) => s._id === selectedStylist)?.name}
                        </p>
                      )}
                      {selectedSlotGroup && (
                        <p>
                          {moment(selectedSlotGroup.startTime).format("MMM D, YYYY")} -{" "}
                          {formatTimeInSalon(selectedSlotGroup.startTime, salon.timeZone)} -{" "}
                          {formatTimeInSalon(selectedSlotGroup.endTime, salon.timeZone)}
                        </p>
                      )}
                      {serviceOption === "home" && (
                        <p>Home Service Charge: ₹99</p>
                      )}
                      <p className="mt-1 font-semibold">Total: ₹{calculateTotal().toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Service Option
                      </label>
                      <Select
                        value={serviceOption}
                        onValueChange={(value) => setServiceOption(value as "home" | "store")}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="store">Store</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Method
                      </label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value as "online" | "cash" | "wallet")}
                        disabled={selectedServices.length === 0}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem
                            value="wallet"
                            disabled={walletBalance !== null && walletBalance < calculateTotal()}
                          >
                            Wallet (₹{walletBalance !== null ? walletBalance.toFixed(2) : "Loading"})
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleBookNow}
                      className="bg-blue-600 hover:bg-blue-700 mt-4"
                      disabled={loading || slotLoading}
                    >
                      Book Now
                    </Button>
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
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlotGroup(null);
            }}
            className="p-2 border rounded-lg w-full"
          />
        </div>

        {selectedDate && (
          <div className="bg-white p-4 rounded-lg shadow-md mt-8">
            <h3 className="text-lg font-semibold mb-4">Select Stylist</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stylists &&
                stylists.map((stylist) => (
                  <button
                    key={stylist._id}
                    onClick={() => {
                      setSelectedStylist(stylist._id);
                      setSelectedSlotGroup(null);
                    }}
                    className={`p-3 rounded-lg transition-colors ${
                      selectedStylist === stylist._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <p className="font-medium">{stylist.name}</p>
                    <p className="text-sm text-yellow-500">
                      {stylist.rating === 0 ? "No ratings yet" : `${stylist.rating}/5 stars`}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-2xl font-semibold mb-4">Available Slots</h2>
          {slotLoading ? (
            <div className="text-center py-4">Loading slots...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slotGroups.length > 0 ? (
                slotGroups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => setSelectedSlotGroup(group)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      selectedSlotGroup?._id === group._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {formatTimeInSalon(group.startTime, salon.timeZone)} -{" "}
                    {formatTimeInSalon(group.endTime, salon.timeZone)} ({group.duration} min)
                  </button>
                ))
              ) : (
                <p className="text-gray-500">
                  {selectedServices.length === 0
                    ? "Select a service to view slots"
                    : selectedStylist
                    ? "No slots available for selected date and stylist"
                    : "Select a stylist to view slots"}
                </p>
              )}
            </div>
          )}
        </div>

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
                      <div>{renderStars(review.salonRating)}</div>
                      <p className="text-sm text-gray-700 mt-1">{review.salonComment}</p>
                    </div>
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