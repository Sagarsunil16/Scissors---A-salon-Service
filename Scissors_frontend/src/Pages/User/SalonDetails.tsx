import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import Navbar from "@/shared/ui/organisms/navigation/Navbar";
import Footer from "@/shared/ui/organisms/navigation/Footer";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createBooking,
  fetchServiceStylist,
  getAvailableSlot,
  getSalonDetails,
  getWalletBalance,
} from "@/features/user/api/UserAPI";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/shared/ui/primitives/card";
import {
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Scissors,
  ShieldCheck,
  Star,
  Store,
  UserRound,
} from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
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
  const [stylistLoading, setStylistLoading] = useState(false);
  const [stylistError, setStylistError] = useState<string | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [slotGroups, setSlotGroups] = useState<SlotGroup[]>([]);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [selectedSlotGroup, setSelectedSlotGroup] = useState<SlotGroup | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

    if (currentUser && selectedServices.length > 0) {
      fetchWalletBalance();
    } else {
      setWalletBalance(null);
    }
  }, [currentUser, selectedServices]);

  useEffect(() => {
    const fetchStylists = async () => {
      if (selectedServices.length > 0 && id) {
        setStylistLoading(true);
        setStylistError(null);
        try {
          const response = await fetchServiceStylist({
            salonId: id,
            serviceIds: selectedServices,
            date: selectedDate,
          });
          setStylists(response.data.stylists || []);
          setSelectedStylist(null);
          setSlotGroups([]);
          setSelectedSlotGroup(null);
        } catch (error: any) {
          setStylists([]);
          setStylistError(error.response?.data?.message || "No stylists available for the selected services.");
          console.error("Error fetching stylists:", error);
        } finally {
          setStylistLoading(false);
        }
      } else {
        setStylists([]);
        setStylistError(null);
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
        setSlotError(null);
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
          setSlotGroups([]);
          setSelectedSlotGroup(null);
          setSlotError(error.response?.data?.message || error.message || "Failed to fetch available slots");
        } finally {
          setSlotLoading(false);
        }
      } else {
        setSlotGroups([]);
        setSlotError(null);
        setTotalDuration(0);
      }
    };
    fetchAvailableSlots();
  }, [id, selectedStylist, selectedServices, selectedDate]);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
    setSelectedStylist(null);
    setSelectedSlotGroup(null);
  };

  const getServiceOffers = (serviceId: string) => {
    return offers.filter(
      (offer) =>
        offer.isActive &&
        new Date(offer.expiryDate) >= new Date() &&
        (offer.serviceIds.length === 0 ||
          offer.serviceIds.some((service) => service._id === serviceId))
    );
  };

  const calculateTotal = () => {
    if (!salon) return 0;
    let total = selectedServices.reduce((sum, serviceId) => {
      const service = salon.services.find((item) => item._id === serviceId);
      if (!service) return sum;
      const serviceOffers = getServiceOffers(service.service._id);
      const maxDiscount =
        serviceOffers.length > 0
          ? Math.max(...serviceOffers.map((offer) => offer.discount), 0)
          : 0;
      return sum + service.price * (1 - maxDiscount / 100);
    }, 0);

    if (serviceOption === "home") total += 99;
    return total;
  };

  const getMinDate = () => new Date().toISOString().split("T")[0];

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split("T")[0];
  };

  const isAddressValid = () => {
    const { areaStreet, city, state, pincode } = currentUser?.address || {};
    return areaStreet && city && state && pincode;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`mr-1 inline-block h-4 w-4 ${
          index + 1 <= rating ? "fill-amber-400 text-amber-400" : "text-muted"
        }`}
      />
    ));
  };

  const handleBookNow = async () => {
    if (!salon || bookingLoading) return;
    if (!currentUser) {
      toast.info("Please sign in to book this appointment");
      navigate("/login", { state: { from: location } });
      return;
    }
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
      const stylistName =
        stylists.find((stylist) => stylist._id === selectedStylist)?.name || "";
      const serviceNames = selectedServices
        .map((serviceId) => salon.services.find((service) => service._id === serviceId)?.name)
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
      if (error.response?.data?.message?.includes("slot")) {
        setSelectedSlotGroup(null);
        setSlotGroups([]);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="section-shell pt-32">
          <div className="app-surface rounded-lg p-10 text-center text-muted-foreground">
            Loading salon details...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="section-shell pt-32">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="section-shell pt-32">
          <div className="app-surface rounded-lg p-10 text-center text-muted-foreground">
            Salon not found
          </div>
        </main>
      </div>
    );
  }

  const selectedServiceDetails = selectedServices
    .map((serviceId) => salon.services.find((service) => service._id === serviceId))
    .filter(Boolean) as Service[];
  const heroImages = salon.images.length > 0 ? salon.images.slice(0, 4) : [];
  const primaryImage = heroImages[0]?.url || "/images/salon1.jpeg";
  const fullAddress = `${salon.address.areaStreet}, ${salon.address.city}, ${salon.address.state} - ${salon.address.pincode}`;
  const selectedServicesDuration = selectedServiceDetails.reduce(
    (sum, service) => sum + service.duration,
    0
  );
  const selectedStylistName =
    stylists.find((stylist) => stylist._id === selectedStylist)?.name || "";
  const canAttemptBooking =
    selectedServices.length > 0 &&
    Boolean(selectedStylist) &&
    Boolean(selectedSlotGroup) &&
    !slotLoading &&
    !stylistLoading;
  const reviewDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => Math.round(review.salonRating) === star).length;
    return {
      star,
      count,
      percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-0">
      <Navbar />
      <main className="pt-20">
        <section className="border-b border-border bg-white">
          <div className="section-shell py-8">
            <div className="app-surface grid gap-6 rounded-lg p-3 lg:grid-cols-[minmax(360px,0.88fr)_1.12fr] lg:p-4">
            <div className="grid gap-3">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                <img src={primaryImage} alt={salon.salonName} className="h-full w-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(heroImages.length > 1
                  ? heroImages.slice(1)
                  : [
                      { url: "/images/gallery1.jpeg", _id: "fallback-1" },
                      { url: "/images/gallery2.jpeg", _id: "fallback-2" },
                      { url: "/images/gallery3.jpeg", _id: "fallback-3" },
                      { url: "/images/gallery4.jpeg", _id: "fallback-4" },
                    ]
                )
                  .slice(0, 4)
                  .map((image, index) => (
                    <div key={image._id || index} className="aspect-square overflow-hidden rounded-md bg-muted ring-1 ring-border">
                      <img src={image.url} alt={`${salon.salonName} gallery ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-col justify-between px-1 py-1 lg:px-3">
              <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Scissors className="h-3.5 w-3.5" />
                  Verified salon profile
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${salon.is_Active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {salon.is_Active ? "Accepting bookings" : "Currently unavailable"}
                </div>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {salon.salonName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                  <Star className="h-4 w-4 fill-current" />
                  {salon.rating.toFixed(1)} ({salon.reviewCount} reviews)
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  {salon.address.areaStreet}, {salon.address.city}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Browse services, compare available stylists, pick a slot, and confirm your appointment with a secure booking flow.
              </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoTile icon={<Clock className="h-5 w-5" />} label="Open hours" value={`${formatTime(salon.openingTime)} - ${formatTime(salon.closingTime)}`} />
                <InfoTile icon={<MapPin className="h-5 w-5" />} label="Location" value={fullAddress} />
                <InfoTile icon={<Phone className="h-5 w-5" />} label="Contact" value={String(salon.phone)} />
                <InfoTile icon={<Mail className="h-5 w-5" />} label="Email" value={salon.email} />
              </div>
            </div>
            </div>
          </div>
        </section>

        <section className="section-shell grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">

            <section className="app-surface rounded-lg p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Services</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Choose services and pricing</h2>
                </div>
                <span className="text-sm text-muted-foreground">{selectedServices.length} selected</span>
              </div>

              <div className="mt-5 grid gap-3">
                {salon.services.map((service) => {
                  const offersForService = getServiceOffers(service.service._id);
                  const bestDiscount = offersForService.length > 0 ? Math.max(...offersForService.map((offer) => offer.discount), 0) : 0;
                  const isSelected = selectedServices.includes(service._id);

                  return (
                    <article key={service._id} className={`rounded-lg border p-4 transition ${isSelected ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/50"}`}>
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                          <Scissors className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{service.name}</h3>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">{service.description} · {service.duration} min</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-base font-semibold text-foreground">Rs {service.price}</span>
                              <button type="button" onClick={() => toggleService(service._id)} className={`flex h-10 w-10 items-center justify-center rounded-md transition ${isSelected ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"}`} aria-label={isSelected ? "Remove service" : "Add service"}>
                                {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          {bestDiscount > 0 && (
                            <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                              Best offer: {bestDiscount}% off
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="app-surface rounded-lg p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Schedule</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Pick date, stylist, and slot</h2>

              <div className="mt-5 grid gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Date</span>
                  <input type="date" value={selectedDate} min={getMinDate()} max={getMaxDate()} onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedStylist(null);
                    setSelectedSlotGroup(null);
                  }} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-primary transition focus:ring-2" />
                </label>

                {selectedServices.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Stylist</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {stylistLoading ? (
                        <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">Finding stylists who can perform all selected services...</p>
                      ) : stylistError ? (
                        <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">{stylistError}</p>
                      ) : stylists.length > 0 ? stylists.map((stylist) => (
                        <button type="button" key={stylist._id} onClick={() => {
                          setSelectedStylist(stylist._id);
                          setSelectedSlotGroup(null);
                        }} className={`rounded-lg border p-3 text-left transition ${selectedStylist === stylist._id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white hover:border-primary"}`}>
                          <UserRound className="h-4 w-4" />
                          <p className="mt-2 font-semibold">{stylist.name}</p>
                          <p className={`text-xs ${selectedStylist === stylist._id ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                            {stylist.rating === 0 ? "No ratings yet" : `${stylist.rating}/5 stars`}
                          </p>
                        </button>
                      )) : (
                        <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">No stylists available for the selected services.</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-foreground">Available slots</h3>
                  {slotLoading ? (
                    <div className="mt-3 rounded-md bg-muted p-4 text-sm text-muted-foreground">Loading slots...</div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {slotError ? (
                        <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">{slotError}</p>
                      ) : slotGroups.length > 0 ? slotGroups.map((group) => (
                        <button type="button" key={group._id} onClick={() => setSelectedSlotGroup(group)} className={`rounded-md border px-3 py-2 text-sm font-medium transition ${selectedSlotGroup?._id === group._id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-foreground hover:border-primary"}`}>
                          {formatTimeInSalon(group.startTime, salon.timeZone)} - {formatTimeInSalon(group.endTime, salon.timeZone)}
                        </button>
                      )) : (
                        <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                          {selectedServices.length === 0 ? "Select a service to view available slots." : selectedStylist ? "No slots available for the selected date and stylist." : "Select a stylist to view available slots."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="app-surface rounded-lg p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Reviews</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Customer reviews</h2>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  <Star className="h-4 w-4 fill-current" />
                  {salon.rating.toFixed(1)}
                </div>
              </div>
              {reviews.length > 0 ? (
                <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
                  <div className="rounded-lg border border-border bg-muted p-4">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-semibold text-foreground">{salon.rating.toFixed(1)}</span>
                      <span className="pb-1 text-sm text-muted-foreground">out of 5</span>
                    </div>
                    <div className="mt-2">{renderStars(Math.round(salon.rating))}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{reviews.length} verified review{reviews.length === 1 ? "" : "s"}</p>
                    <div className="mt-4 space-y-2">
                      {reviewDistribution.map((item) => (
                        <div key={item.star} className="grid grid-cols-[28px_1fr_34px] items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.star} star</span>
                          <div className="h-2 overflow-hidden rounded-full bg-white">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${item.percentage}%` }} />
                          </div>
                          <span className="text-right">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3">
                  {reviews.map((review) => (
                    <Card key={review._id} className="border border-border shadow-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-foreground">{review.userId?.firstname} {review.userId?.lastname}</p>
                          <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2">{renderStars(review.salonRating)}</div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.salonComment}</p>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </div>
              ) : (
                <p className="mt-5 rounded-md bg-muted p-4 text-sm text-muted-foreground">No reviews yet. Book an appointment to share your experience.</p>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="app-surface overflow-hidden rounded-lg">
              <div className="border-b border-border bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Booking</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Summary</h2>
                </div>
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Select services, stylist, and slot to complete your appointment.</p>
              </div>

              <div className="space-y-3 p-5">
                {selectedServiceDetails.length > 0 ? selectedServiceDetails.map((service) => {
                  const offersForService = getServiceOffers(service.service._id);
                  const maxDiscount = offersForService.length > 0 ? Math.max(...offersForService.map((offer) => offer.discount), 0) : 0;
                  const discountedPrice = service.price * (1 - maxDiscount / 100);
                  return (
                    <div key={service._id} className="rounded-md bg-muted p-3">
                      <div className="flex justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">{service.name}</p>
                        <p className="text-sm font-semibold text-foreground">Rs {discountedPrice.toFixed(0)}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{service.duration} min</p>
                    </div>
                  );
                }) : (
                  <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">Select one or more services to start booking.</p>
                )}
              </div>

              <div className="grid gap-3 border-t border-border px-5 pt-5">
                <div>
                  <label className="text-sm font-medium text-foreground">Service option</label>
                  <Select value={serviceOption} onValueChange={(value) => setServiceOption(value as "home" | "store")}>
                    <SelectTrigger className="mt-2 w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="store"><span className="inline-flex items-center gap-2"><Store className="h-4 w-4" /> Store</span></SelectItem>
                      <SelectItem value="home"><span className="inline-flex items-center gap-2"><Home className="h-4 w-4" /> Home</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Payment method</label>
                  <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "online" | "cash" | "wallet")} disabled={selectedServices.length === 0}>
                    <SelectTrigger className="mt-2 w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online"><span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" /> Online</span></SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="wallet" disabled={walletBalance !== null && walletBalance < calculateTotal()}>
                        Wallet (Rs {walletBalance !== null ? walletBalance.toFixed(2) : "Loading"})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mx-5 mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Duration</span>
                  <span>{totalDuration || selectedServicesDuration} min</span>
                </div>
                {selectedStylist && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Stylist</span>
                    <span>{selectedStylistName}</span>
                  </div>
                )}
                {selectedSlotGroup && (
                  <div className="rounded-md bg-muted p-3 text-muted-foreground">
                    <CalendarDays className="mb-2 h-4 w-4 text-primary" />
                    {moment(selectedSlotGroup.startTime).format("MMM D, YYYY")} · {formatTimeInSalon(selectedSlotGroup.startTime, salon.timeZone)} - {formatTimeInSalon(selectedSlotGroup.endTime, salon.timeZone)}
                  </div>
                )}
                {serviceOption === "home" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Home service charge</span>
                    <span>Rs 99</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-lg font-semibold text-foreground">
                  <span>Total</span>
                  <span>Rs {calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="p-5">
                <Button onClick={handleBookNow} className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || bookingLoading || !canAttemptBooking}>
                  {bookingLoading ? "Processing..." : currentUser ? "Book now" : "Sign in to book"}
                </Button>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {selectedServices.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-lg backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{selectedServices.length} service selected</p>
              <p className="text-lg font-semibold text-foreground">Rs {calculateTotal().toFixed(2)}</p>
            </div>
            <Button onClick={handleBookNow} className="h-11 bg-primary px-5 text-primary-foreground hover:bg-primary/90" disabled={loading || bookingLoading || !canAttemptBooking}>
              {bookingLoading ? "Processing..." : currentUser ? "Book now" : "Sign in"}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const InfoTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-md border border-border bg-muted p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-primary shadow-sm">{icon}</div>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
};

export default SalonDetails;
