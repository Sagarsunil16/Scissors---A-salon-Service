import { Elements, useStripe } from '@stripe/react-stripe-js';
import { Link, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useState, useEffect } from "react";
import { paymentIntentResponse, getSalonDetails } from "../../Services/UserAPI";
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Service {
  _id: string;
  name: string;
  duration: number;
}

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const location = useLocation();
  const {
    user,
    salonId,
    selectedServices = [],
    slotIds = [],
    startTime,
    endTime,
    selectedStylist,
    stylistName,
    serviceNames = [],
    serviceOption,
    totalPrice,
    totalDuration,
    reservedUntil,
    timeZone,
    selectedAddress,
    bookingId,
    appointmentId,
    paymentMethod,
  } = location.state || {};
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      if (salonId) {
        try {
          const response = await getSalonDetails(salonId);
          setServices(response.data.salonData.services);
        } catch (err: any) {
          console.error("Failed to fetch services:", err.message);
        }
      }
    };
    fetchServices();
  }, [salonId]);

  useEffect(() => {
    if (reservedUntil && moment(reservedUntil).isBefore(moment())) {
      setError("Slot reservation has expired. Please select a new slot.");
      setTimeout(() => navigate(`/salons/${salonId}`), 3000);
    }
  }, [reservedUntil, salonId, navigate]);

  const calculateFinalAmount = () => {
    let finalAmount = totalPrice || 0;
    if (serviceOption === 'home') {
      finalAmount += 99;
    }
    return finalAmount;
  };

  const handleConfirmAndPay = async () => {
    if (isLoading) return;
    if (!stripe && paymentMethod !== 'cash') {
      setError("Stripe is not initialized.");
      return;
    }

    setIsLoading(true);
    try {
      const finalAmount = calculateFinalAmount();

      // Convert selectedServices to a string
      const servicesString = selectedServices
        .map((serviceId: string) => {
          const service = services.find(s => s._id === serviceId);
          return service?.name || serviceId;
        })
        .join(", ");

      const payload = {
        amount: finalAmount,
        currency: "inr",
        metadata: {
          userId: user,
          salonId,
          slotIds,
          services: servicesString,
          bookingId,
          appointmentId,
          stylistId: selectedStylist,
          paymentMethod,
          serviceOption,
          serviceIds: selectedServices,
          address: serviceOption === 'home' ? JSON.stringify(selectedAddress) : undefined,
        },
        reservedUntil,
        bookingId,
      };

      console.log("PaymentIntentResponse payload:", payload);

      const response = await paymentIntentResponse(payload);

      if (paymentMethod === 'cash') {
        toast.success("Booking confirmed!");
        navigate('/appointments');
        return;
      }

      const { id: sessionId } = response.data;

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error: any) {
      console.error("Error in handleConfirmAndPay:", error);
      const message = error.response?.data?.message || "Payment failed. Please try again.";
      setError(message);
      toast.error(message);
      if (message.includes('slot')) {
        setTimeout(() => navigate(`/salons/${salonId}`), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error ? (
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <Link to={`/salons/${salonId}`} className="text-blue-600 mt-4 inline-block">
              Back to Salon
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <div className="p-4 border rounded-lg bg-gray-100">
                <h3 className="font-medium text-lg">{paymentMethod === 'cash' ? 'Cash' : 'Online Payment'}</h3>
                <p className="text-gray-500">
                  {paymentMethod === 'cash' ? 'Pay at the salon after service completion' : 'Pay securely using UPI, Credit/Debit Card, or Net Banking'}
                </p>
              </div>
              <button
                onClick={handleConfirmAndPay}
                disabled={!stripe && paymentMethod !== 'cash' || isLoading}
                className="w-full mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : `Confirm and ${paymentMethod === 'cash' ? 'Book' : 'Pay'} ₹${calculateFinalAmount().toFixed(2)}`}
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Booking Summary</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">Selected Services</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedServices.map((serviceId: string, index: number) => {
                      const service = services.find(s => s._id === serviceId);
                      return (
                        <li key={index}>
                          {service?.name || serviceNames[index] || serviceId} ({service?.duration || 30} min)
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Stylist</h3>
                  <p className="text-gray-600">{stylistName || 'Not selected'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Total Duration</h3>
                  <p className="text-gray-600">{totalDuration || 0} minutes</p>
                </div>
                {serviceOption === "home" && (
                  <div>
                    <h3 className="font-medium text-lg">Home Service Charge</h3>
                    <p className="text-gray-600">₹99</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg">Total Amount</h3>
                  <p className="text-gray-600">₹{calculateFinalAmount().toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Selected Time</h3>
                  <p className="text-gray-600">
                    {startTime && timeZone
                      ? `${moment(startTime).tz(timeZone).format("MMMM D, YYYY")} - ${moment(startTime).tz(timeZone).format("h:mm A")} - ${moment(endTime).tz(timeZone).format("h:mm A")}`
                      : 'Not selected'}
                  </p>
                </div>
                {serviceOption === "home" && selectedAddress && (
                  <div>
                    <h3 className="font-medium text-lg">
                      Home Address <span className="text-blue-600 cursor-pointer font-normal"><Link to="/settings">edit</Link></span>
                    </h3>
                    <p className="text-gray-600">
                      {selectedAddress.areaStreet}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const BookingConfirmation = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default BookingConfirmation;