import { Elements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  ReceiptText,
  Scissors,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import moment from "moment-timezone";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getSalonDetails, paymentIntentResponse } from "@/features/user/api/UserAPI";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/primitives/alert";
import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent } from "@/shared/ui/primitives/card";
import Footer from "@/shared/ui/organisms/navigation/Footer";
import Navbar from "@/shared/ui/organisms/navigation/Navbar";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Service {
  _id: string;
  name: string;
  duration: number;
  price?: number;
}

interface BookingState {
  user?: string;
  salonId?: string;
  selectedServices?: string[];
  slotIds?: string[];
  startTime?: string;
  endTime?: string;
  selectedStylist?: string;
  stylistName?: string;
  serviceNames?: string[];
  serviceOption?: "home" | "store";
  totalPrice?: number;
  totalDuration?: number;
  reservedUntil?: string;
  timeZone?: string;
  selectedAddress?: {
    areaStreet: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  bookingId?: string;
  appointmentId?: string;
  paymentMethod?: "online" | "cash";
}

const formatMoney = (amount: number) => `Rs. ${amount.toFixed(2)}`;

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const location = useLocation();
  const booking = (location.state || {}) as BookingState;
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
    serviceOption = "store",
    totalPrice = 0,
    totalDuration = 0,
    reservedUntil,
    timeZone = "Asia/Kolkata",
    selectedAddress,
    bookingId,
    appointmentId,
    paymentMethod = "online",
  } = booking;

  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const missingBookingState =
    !user ||
    !salonId ||
    !bookingId ||
    !reservedUntil ||
    !selectedStylist ||
    !selectedServices.length ||
    !slotIds.length;

  useEffect(() => {
    if (!salonId) return;

    const fetchServices = async () => {
      try {
        const response = await getSalonDetails(salonId);
        setServices(response.data.salonData.services || []);
      } catch (err: any) {
        console.error("Failed to fetch services:", err.message);
      }
    };

    fetchServices();
  }, [salonId]);

  useEffect(() => {
    if (missingBookingState) {
      setError("Booking details are missing. Please choose your services and slot again.");
      return;
    }

    if (moment(reservedUntil).isBefore(moment())) {
      setError("Your slot hold has expired. Please select a new slot.");
    }
  }, [missingBookingState, reservedUntil]);

  const finalAmount = useMemo(() => {
    return serviceOption === "home" ? totalPrice + 99 : totalPrice;
  }, [serviceOption, totalPrice]);

  const selectedServiceDetails = useMemo(() => {
    return selectedServices.map((serviceId, index) => {
      const service = services.find((item) => item._id === serviceId);
      return {
        id: serviceId,
        name: service?.name || serviceNames[index] || "Selected service",
        duration: service?.duration,
      };
    });
  }, [selectedServices, serviceNames, services]);

  const serviceNamesForMetadata = selectedServiceDetails
    .map((service) => service.name)
    .join(", ");

  const selectedDateLabel =
    startTime && timeZone ? moment(startTime).tz(timeZone).format("ddd, MMM D, YYYY") : "Not selected";
  const selectedTimeLabel =
    startTime && endTime && timeZone
      ? `${moment(startTime).tz(timeZone).format("h:mm A")} - ${moment(endTime)
          .tz(timeZone)
          .format("h:mm A")}`
      : "Not selected";
  const holdExpiresLabel = reservedUntil
    ? moment(reservedUntil).tz(timeZone).format("h:mm A")
    : "Unavailable";

  const handleConfirmAndPay = async () => {
    if (isLoading) return;

    if (missingBookingState) {
      setError("Booking details are missing. Please choose your services and slot again.");
      return;
    }

    if (moment(reservedUntil).isBefore(moment())) {
      setError("Your slot hold has expired. Please select a new slot.");
      return;
    }

    if (!stripe && paymentMethod !== "cash") {
      setError("Secure payment is not ready. Please refresh and try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        amount: finalAmount,
        currency: "inr",
        metadata: {
          userId: user,
          salonId,
          slotIds,
          services: serviceNamesForMetadata,
          bookingId,
          appointmentId,
          stylistId: selectedStylist,
          paymentMethod,
          serviceOption,
          serviceIds: selectedServices,
          address:
            serviceOption === "home" && selectedAddress
              ? JSON.stringify(selectedAddress)
              : undefined,
        },
        reservedUntil: reservedUntil as string,
        bookingId: bookingId as string,
      };

      const response = await paymentIntentResponse(payload);

      if (paymentMethod === "cash") {
        toast.success("Booking confirmed!");
        navigate("/appointments");
        return;
      }

      const sessionId = response.data.id;
      if (!sessionId) {
        throw new Error("Payment session was not created.");
      }

      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId });
      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Payment failed. Please try again.";
      setError(message);
      toast.error(message);
      if (message.toLowerCase().includes("slot")) {
        setTimeout(() => navigate(`/salons/${salonId}`), 2500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const backToSalonLink = salonId ? `/salons/${salonId}` : "/salons";

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-slate-950">
      <Navbar />
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            asChild
            variant="ghost"
            className="w-fit text-slate-600 hover:bg-white hover:text-slate-950"
          >
            <Link to={backToSalonLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to salon
            </Link>
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Secure booking checkout
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Confirm booking
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                    Review your appointment
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Your selected slot is being held until {holdExpiresLabel}. Confirm before the hold expires.
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium uppercase text-slate-500">Total</p>
                  <p className="text-2xl font-semibold text-slate-950">{formatMoney(finalAmount)}</p>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Booking needs attention</AlertTitle>
                <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  <Button asChild variant="outline" size="sm" className="w-fit bg-white">
                    <Link to={backToSalonLink}>Choose another slot</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoTile icon={CalendarDays} label="Date" value={selectedDateLabel} />
              <InfoTile icon={Clock} label="Time" value={selectedTimeLabel} />
              <InfoTile icon={UserRound} label="Stylist" value={stylistName || "Selected stylist"} />
              <InfoTile
                icon={Scissors}
                label="Service type"
                value={serviceOption === "home" ? "Home service" : "Visit salon"}
              />
            </div>

            <Card className="rounded-md border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-semibold text-slate-950">Selected services</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedServiceDetails.map((service, index) => (
                    <div key={service.id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-950">{service.name}</p>
                        <p className="text-sm text-slate-500">
                          {service.duration ? `${service.duration} min` : "Duration included in total"}
                        </p>
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {serviceOption === "home" && selectedAddress && (
              <Card className="rounded-md border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-emerald-700" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-950">Home service address</h2>
                        <Link to="/settings" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
                          Edit
                        </Link>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {selectedAddress.areaStreet}, {selectedAddress.city}, {selectedAddress.state} -{" "}
                        {selectedAddress.pincode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-md border-slate-200 shadow-sm">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-md",
                      paymentMethod === "cash"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {paymentMethod === "cash" ? <ReceiptText className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment method</p>
                    <h2 className="font-semibold text-slate-950">
                      {paymentMethod === "cash" ? "Cash after service" : "Online payment"}
                    </h2>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {paymentMethod === "cash"
                    ? "Your appointment will be confirmed now. Pay at the salon after the service is complete."
                    : "You will be redirected to Stripe to complete a secure card payment."}
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-4 text-sm">
                  <PriceRow label="Services" value={formatMoney(totalPrice)} />
                  {serviceOption === "home" && <PriceRow label="Home visit charge" value={formatMoney(99)} />}
                  <PriceRow label="Duration" value={`${totalDuration} min`} />
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                    <span>Payable amount</span>
                    <span>{formatMoney(finalAmount)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmAndPay}
                  disabled={isLoading || missingBookingState || (!stripe && paymentMethod !== "cash") || !!error}
                  className="h-11 w-full rounded-md bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {paymentMethod === "cash" ? "Confirm booking" : `Pay ${formatMoney(finalAmount)}`}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const InfoTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
        <p className="truncate font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  </div>
);

const PriceRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 text-slate-600">
    <span>{label}</span>
    <span className="font-medium text-slate-950">{value}</span>
  </div>
);

const BookingConfirmation = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default BookingConfirmation;
