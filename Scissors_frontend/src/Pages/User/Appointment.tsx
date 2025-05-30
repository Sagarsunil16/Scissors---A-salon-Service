import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import ProfileNavbar from "../../Components/ProfileNavbar";
import moment from "moment-timezone";
import { toast } from "react-toastify";
import {
  cancelAppointment,
  getUserAppointments,
  submitReview,
} from "../../Services/UserAPI";
import Swal from "sweetalert2";

interface Address {
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
}

interface SalonService extends Service {
  description?: string;
  stylists?: string[];
  timeZone?: string;
  service?: string
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
  salon: {
    _id: string;
    salonName: string;
    address: Address;
    timeZone?: string;
    services: SalonService[];
  };
  stylist: {
    _id: string;
    name: string;
  };
  services: string[] | Service[]; // Allow ObjectIds or full objects
  slots: Slot[];
  status: string;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  serviceOption: string;
  address?: Address;
  isExpanded: boolean;
  isReviewed: boolean;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const appointmentsPerPage = 3;

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [salonRating, setSalonRating] = useState("");
  const [salonComment, setSalonComment] = useState("");
  const [stylistRating, setStylistRating] = useState("");
  const [stylistComment, setStylistComment] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = { page: currentPage, limit: appointmentsPerPage };
        const response = await getUserAppointments(data);
        console.log("API Response:", response);

        const formattedAppointments = response.data.data.appointments.map((appt: any) => ({
          ...appt,
          isExpanded: false,
        }));

        console.log("Formatted Appointments:", formattedAppointments);
        setAppointments(formattedAppointments);
        setTotalPages(response.data.data.pages || 1);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.error || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentPage]);

  const toggleExpand = (id: string) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment._id === id
          ? { ...appointment, isExpanded: !appointment.isExpanded }
          : appointment
      )
    );
  };

  const handleReviewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      const response = await cancelAppointment(appointmentId);
      console.log("Appointment Cancelled:", response);
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: "cancelled" } : appt
        )
      );
      toast.success("Appointment cancelled successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      await handleCancelAppointment(id);
      console.log("Confirmed cancellation");
    } else {
      console.log("Cancellation aborted");
    }
  };

  const formatAddress = (address?: Address) => {
    if (!address) return "N/A";
    return `${address.areaStreet}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  const formatSlotTimeRange = (slots: Slot[], timeZone: string = "Asia/Kolkata") => {
    if (!slots || slots.length === 0) return "N/A";
    const sortedSlots = [...slots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const start = moment.utc(sortedSlots[0].startTime).tz(timeZone);
    const end = moment.utc(sortedSlots[sortedSlots.length - 1].endTime).tz(timeZone);
    return `${start.format("Do MMMM, YYYY [at] h:mm A")} - ${end.format("h:mm A")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Map service ObjectIds to full service objects from salon.services
  const getServiceDetails = (serviceId: string | Service, salonServices: SalonService[]): Service => {
    if (typeof serviceId === "string") {
      const service = salonServices.find((s) => s._id === serviceId || s.service === serviceId);
      return service
        ? { _id: service._id, name: service.name, price: service.price, duration: service.duration }
        : { _id: serviceId, name: "Unknown Service", price: 0, duration: 0 };
    }
    return serviceId; // Already a Service object
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    try {
      const data = {
        salonId: selectedAppointment.salon._id,
        stylistId: selectedAppointment.stylist._id,
        appointmentId: selectedAppointment._id,
        salonRating: Number(salonRating),
        salonComment,
        stylistRating: Number(stylistRating),
        stylistComment,
      };
      await submitReview(data);
      setShowReviewModal(false);
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === selectedAppointment._id ? { ...appt, isReviewed: true } : appt
        )
      );
      setSalonRating("");
      setSalonComment("");
      setStylistRating("");
      setStylistComment("");
      setSelectedAppointment(null);
      toast.success("Review submitted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSalonRating("");
    setSalonComment("");
    setStylistRating("");
    setStylistComment("");
    setSelectedAppointment(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex justify-center py-4 mt-20">
        <ProfileNavbar />
      </div>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">Appointment History</h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-4 text-gray-600">No appointments found</div>
        ) : (
          <>
            {appointments.map((appointment) => (
              <Card
                key={appointment._id}
                className="mb-4 p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <CardContent>
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <p className="text-gray-600 font-medium">
                        {formatSlotTimeRange(appointment.slots, appointment.salon.timeZone)}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}
                        >
                          {appointment.status}
                        </span>
                        <p className="text-sm text-gray-500">
                          {appointment.services.length} Service{appointment.services.length !== 1 ? "s" : ""} • ₹
                          {appointment.totalPrice.toFixed(2)} • {appointment.paymentStatus}
                        </p>
                      </div>
                    </div>
                    {appointment.status.toLowerCase() === "completed" && (
                      <Button
                        variant="outline"
                        disabled={appointment.isReviewed}
                        size="sm"
                        onClick={() => handleReviewClick(appointment)}
                      >
                        {appointment.isReviewed ? "Reviewed" : "Submit Review"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(appointment._id)}
                    >
                      {appointment.isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </Button>
                  </div>
                  {appointment.isExpanded && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-semibold text-lg mb-2">
                        {appointment.salon.salonName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {appointment.serviceOption === "home"
                          ? formatAddress(appointment.address)
                          : formatAddress(appointment.salon.address)}
                      </p>
                      <div className="space-y-2 mb-3">
                        {appointment.services.map((service) => {
                          const serviceDetails = getServiceDetails(service, appointment.salon.services);
                          return (
                            <div
                              key={serviceDetails._id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {serviceDetails.name} ({serviceDetails.duration} min)
                              </span>
                              <span>₹{serviceDetails.price.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-sm font-semibold border-t pt-3">
                        <span>Total</span>
                        <span>₹{appointment.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="mt-3 text-sm space-y-1">
                        <p>
                          Stylist: {appointment.stylist.name || "Not specified"}
                        </p>
                        <p>
                          Service Type: {appointment.serviceOption === "home" ? "At Home" : "At Salon"}
                        </p>
                        <p>Payment Method: {appointment.paymentMethod || "N/A"}</p>
                        <p>Payment Status: {appointment.paymentStatus}</p>
                      </div>
                      {["pending", "confirmed"].includes(appointment.status.toLowerCase()) && (
                        <div className="mt-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={loading}
                            onClick={() => handleCancel(appointment._id)}
                          >
                            {loading ? "Processing..." : "Cancel Appointment"}
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">
                            You can only cancel pending or confirmed appointments
                          </p>
                        </div>
                      )}
                      {appointment.status.toLowerCase() === "cancelled" && (
                        <p className="text-sm text-red-600 mt-3">
                          This appointment has been cancelled
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-center mt-6 space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Submit Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Salon Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={salonRating}
                    onChange={(e) => setSalonRating(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Salon Comment
                  </label>
                  <textarea
                    value={salonComment}
                    onChange={(e) => setSalonComment(e.target.value)}
                    className="w-full border rounded p-2"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Stylist Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={stylistRating}
                    onChange={(e) => setStylistRating(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Stylist Comment
                  </label>
                  <textarea
                    value={stylistComment}
                    onChange={(e) => setStylistComment(e.target.value)}
                    className="w-full border rounded p-2"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={closeReviewModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default">
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Appointments;