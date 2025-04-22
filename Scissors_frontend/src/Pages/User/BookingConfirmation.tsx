  import {Elements,useStripe} from '@stripe/react-stripe-js'
  import { Link, useLocation } from "react-router-dom";
  import Navbar from "../../Components/Navbar";
  import Footer from "../../Components/Footer";
  import { useState } from "react";
  import { createAppointment, paymentIntentResponse } from "../../Services/UserAPI";
  import { useNavigate } from 'react-router-dom';
  import {loadStripe} from '@stripe/stripe-js'
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  const CheckoutForm = () => {
    const navigate = useNavigate()
      const stripe = useStripe()
    const location = useLocation();
    const {
      user,
      salon,
      selectedServices,
      selectedSlot,
      selectedDate,
      selectedStylist,
      stylistName,
      serviceNames,
      slotId,
      serviceOption,
      totalPrice,
      selectedAddress, // Address for home service
    } = location.state || {};
    const [selectedMethod, setSelectedMethod] = useState<
      "Online" | "Cash" | null
    >(null);
    console.log(stylistName,serviceNames);
    const handlePaymentMethodSelection = (method: "Online" | "Cash") => {
      setSelectedMethod(method);
    };

    const calculateFinalAmount = ()=>{
      let finalAmount = totalPrice
      if(selectedMethod === 'Cash'){
          finalAmount+=30
      }
      if(serviceOption==='home'){
          finalAmount+=99
      }
      return finalAmount
    }

    const handleConfirmAndPay = async () => {
      if (!selectedMethod) {
          alert("Please select a payment method");
          return;
      }

      if (selectedMethod === "Cash") {
          // Handle cash payment logic
          alert("Please pay in cash at the salon or to the stylist.");
          return;
      }

      try {
          const finalAmount = calculateFinalAmount();
        
          const metadata = {
            user: user, // User ID
            salon: salon, // Salon ID
            stylist: selectedStylist, // Stylist ID
            services: selectedServices.join(","), // Convert array of service IDs to a comma-separated string
            slot: slotId, // Slot ID
            serviceOption: serviceOption, // Service option (home or store)
            address: serviceOption === "home" ? JSON.stringify(selectedAddress) : undefined, // Address for home service
          };

          const data = { amount: finalAmount, currency: "inr",metadata };
          const response = await paymentIntentResponse(data);
          const {id:sessionId} = response.data
          if(!sessionId){
              throw new Error("Session ID not received");
          }
        
          const stripe = await stripePromise;
          if(!stripe){
              throw new Error("Stripe failed to initialize");
          }

          const { error } = await stripe.redirectToCheckout({
              sessionId:sessionId
          })

          // const appointmentData = {
          //   user:user,
          //   salon:salon,
          //   stylist:selectedStylist,
          //   services:selectedServices,
          //   slot:selectedSlot,
          //   status:'pending',
          //   totalPrice:finalAmount,
          //   paymentStatus:'paid',
          //   serviceOption:serviceOption,
          //   address:serviceOption==='home'? selectedAddress : undefined
          // }

          // const appointmentResponse = await createAppointment(appointmentData)

          // if(appointmentResponse.status === 200){
          //   navigate('/booking-sucess',{state:{appointmentId:appointmentResponse.data._id}})
          // }else{
          //   throw new Error('Failed to create appointment')
          // }

          if (error) {
              console.log("Payment Failed", error);
              alert("Payment Failed, Please try again later");
          }
      } catch (error: any) {
          console.log("Error during payment", error);
          alert("Payment failed. Please Try Again");
      }
  };

    return (
      <div className="bg-gray-50">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payment Method Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">
              Select Payment Method
            </h2>
            <label className="flex items-center p-4 border rounded-lg hover:bg-gray-100 transition-colors cursor-pointer mb-4">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={selectedMethod === "Online"}
                onChange={() => handlePaymentMethodSelection("Online")}
                className="mr-4"
              />
              <div>
                <h3 className="font-medium text-lg">Online Payment</h3>
                <p className="text-gray-500">
                  Pay securely using UPI, Credit/Debit Card, or Net Banking
                </p>
              </div>
            </label>

            <label className="flex items-center p-4 border rounded-lg hover:bg-gray-100 transition-colors cursor-pointer mb-4">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={selectedMethod === "Cash"}
                onChange={() => handlePaymentMethodSelection("Cash")}
                className="mr-4"
              />
              <div>
                <h3 className="font-medium text-lg">Pay with Cash</h3>
                <p className="text-gray-500">
                  Pay in cash at the salon or to the stylist
                </p>
              </div>
            </label>

            {/* Confirm and Pay Button */}
            {selectedMethod && (
              <button
                onClick={handleConfirmAndPay}
                disabled={!stripe}
                className="w-full mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm and Pay ₹{calculateFinalAmount()}
              </button>
            )}
          </div>

          {/* Booking Summary Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Booking Summary</h2>
            <div className="space-y-4">
              {/* Selected Services */}
              <div>
                <h3 className="font-medium text-lg">Selected Services</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {serviceNames.map((serviceName: string, index: number) => (
                    <li key={index}>{serviceName}</li>
                  ))}
                </ul>
              </div>

              {/* Stylist Name */}
              <div>
                <h3 className="font-medium text-lg">Stylist</h3>
                <p className="text-gray-600">{stylistName}</p>
              </div>

              {/* Home Service Charge (if applicable) */}
              {serviceOption === "home" && (
                <div>
                  <h3 className="font-medium text-lg">Home Service Charge</h3>
                  <p className="text-gray-600">₹99</p>
                </div>
              )}

              {/* Cash Payment Charge (if applicable) */}
              {selectedMethod === "Cash" && (
                <div>
                  <h3 className="font-medium text-lg">Cash Payment Charge</h3>
                  <p className="text-gray-600">₹30</p>
                </div>
              )}

              {/* Total Amount */}
              <div>
                <h3 className="font-medium text-lg">Total Amount</h3>
                <p className="text-gray-600">₹{calculateFinalAmount()}</p>
              </div>

              {/* Selected Date & Time */}
              <div>
                <h3 className="font-medium text-lg">Selected Date & Time</h3>
                <p className="text-gray-600">
                  {new Date(selectedDate).toLocaleDateString()} -{" "}
                  {new Date(selectedSlot).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>

              {/* Delivery Address (if home service is selected) */}
              {serviceOption === "home" && selectedAddress && (
                <div>
                  <h3 className="font-medium text-lg">Home Address <span className="text-blue-600 cursor-pointer font-normal"><Link to={'/settings'}>edit</Link></span> </h3>
                  <p className="text-gray-600">
                    {selectedAddress.areaStreet}, {selectedAddress.city},{" "}
                    {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    );
  };

  const BookingConfirmation = ()=>{
      return (
          <Elements stripe={stripePromise}>
                  <CheckoutForm/>
          </Elements>
      )
      
  }
  export default BookingConfirmation;
