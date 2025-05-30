import { Elements, useStripe } from '@stripe/react-stripe-js';
import { Link, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useState, useEffect } from "react";
import { paymentIntentResponse, getSalonDetails } from "../../Services/UserAPI";
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import moment from 'moment-timezone';

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
    salon,
    selectedServices,
    slotIds,
    startTime,
    endTime,
    selectedStylist,
    stylistName,
    serviceNames,
    serviceOption,
    totalPrice,
    totalDuration,
    reservedUntil,
    timeZone,
    selectedAddress,
  } = location.state || {};
  const [selectedMethod] = useState<"Online">("Online");
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      if (salon) {
        try {
          const response = await getSalonDetails(salon);
          setServices(response.data.salonData.services);
        } catch (err) {
          console.error("Failed to fetch services:", err);
        }
      }
    };
    fetchServices();
  }, [salon]);

  useEffect(() => {
    if (reservedUntil && moment(reservedUntil).isBefore(moment())) {
      setError("Slot reservation has expired. Please select a new slot.");
      setTimeout(() => navigate(`/salons/${salon}/salon-details`), 3000);
    }
  }, [reservedUntil, salon, navigate]);

  const calculateFinalAmount = () => {
    let finalAmount = totalPrice;
    if (serviceOption === 'home') {
      finalAmount += 99;
    }
    return finalAmount;
  };

  const handleConfirmAndPay = async () => {
    if (!stripe) {
      setError("Stripe is not initialized.");
      return;
    }

    try {
      const finalAmount = calculateFinalAmount();

      const metadata = {
        user,
        salon,
        stylist: selectedStylist,
        services: selectedServices.join(","),
        slotIds: slotIds,
        serviceOption,
        address: serviceOption === 'home' ? JSON.stringify(selectedAddress) : undefined,
      };

      const response = await paymentIntentResponse({
        amount: finalAmount,
        currency: "inr",
        metadata,
        reservedUntil
      });
      const { id: sessionId } = response.data;

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error: any) {
      console.error("Error in handleConfirmAndPay:", error);
      setError(error.response?.data?.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error ? (
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <Link to={`/salons/${salon}/salon-details`} className="text-blue-600 mt-4 inline-block">
              Back to Salon
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <div className="p-4 border rounded-lg bg-gray-100">
                <h3 className="font-medium text-lg">Online Payment</h3>
                <p className="text-gray-500">Pay securely using UPI, Credit/Debit Card, or Net Banking</p>
              </div>
              <button
                onClick={handleConfirmAndPay}
                disabled={!stripe}
                className="w-full mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm and Pay ₹{calculateFinalAmount().toFixed(2)}
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
                          {service?.name || serviceNames[index]} ({service?.duration || 30} min)
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Stylist</h3>
                  <p className="text-gray-600">{stylistName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Total Duration</h3>
                  <p className="text-gray-600">{totalDuration} minutes</p>
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
                    {moment(startTime).tz(timeZone).format("MMMM D, YYYY")} -{" "}
                    {moment(startTime).tz(timeZone).format("h:mm A")} -{" "}
                    {moment(endTime).tz(timeZone).format("h:mm A")}
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