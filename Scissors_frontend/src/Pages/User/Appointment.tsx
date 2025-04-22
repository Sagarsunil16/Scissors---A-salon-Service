import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import ProfileNavbar from "../../Components/ProfileNavbar";
// import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { toast } from "react-hot-toast";
import { cancelAppointment, getUserAppointments } from "../../Services/UserAPI";
import Swal from "sweetalert2";

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
}
interface Address {
    areaStreet: string;
    city: string;
    state: string;
    pincode: string;
  }
  interface Appointment {
    _id: string;
    salon: {
      salonName: string;
      address: Address;
    };
    services: Service[];
    slot: {
      startTime: string;
      endTime: string;
    };
    status: string;
    totalPrice: number;
    paymentMethod: string;
    paymentStatus: string;
    serviceOption: string;
    address?: Address; // Make address optional since it's only for home service
    isExpanded: boolean;
  }

 



const Appointments: React.FC = () => {
//   const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const appointmentsPerPage = 3;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = {page:currentPage,limit:appointmentsPerPage}
        const response = await getUserAppointments(data)
        console.log(response,"res")
        const formattedAppointments = response.data.data.appointments.map((appt: any) => ({
          ...appt,
          isExpanded: false
        }));
        console.log(formattedAppointments,"formatteddAppointments")
        const enriched = enrichAppointments(formattedAppointments,formattedAppointments[0]?.salon?.services || [])
        console.log(enriched,"enriched")
        setAppointments(enriched);
        setTotalPages(response.data.data.pages);
      } catch (err: any) {
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
        appointment._id === id ? { ...appointment, isExpanded: !appointment.isExpanded } : appointment
      )
    );
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
  
      // Trigger API to cancel the appointment
      const response = await cancelAppointment(appointmentId);
      console.log("Appointment Cancelled: ", response);
  
      // Update the local state to reflect cancellation
      setAppointments(prev =>
        prev.map(appt =>
          appt._id === appointmentId
            ? { ...appt, status: 'cancelled' }
            : appt
        )
      );
  
      toast.success("Appointment cancelled successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setLoading(false);
    }
  }
  
  const handleCancel = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, do it!',
      cancelButtonText: 'Cancel',
    });
  
    if (result.isConfirmed) {
      await handleCancelAppointment(id); // Call the function that handles cancellation logic
      console.log('Confirmed ✅');
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log('Cancelled ❌');
    }
  }
  
  const formatAddress = (address?: Address) => {
    if (!address) return "";
    return `${address.areaStreet}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("Do MMMM, YYYY [at] h:mm A");
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

  const enrichAppointments = (appointments: Appointment[], salonServicesMap: any[]) => {
    return appointments.map((appointment) => {
      const enrichedServices = appointment.services.map((serviceId: any) => {
        return salonServicesMap.find((s: any) => s._id === serviceId);
      }).filter(Boolean);
  
      return {
        ...appointment,
        services: enrichedServices,
      };
    });
  };
  

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="flex justify-center py-4 mt-20">
        <ProfileNavbar />
      </div>
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Appointment History</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-4">No appointments found</div>
        ) : (
          <>
            {appointments.map((appointment) => (
              <Card key={appointment._id} className="mb-4 p-4 border border-gray-200 rounded-lg shadow-sm">
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600">
                        {formatDate(appointment.slot.startTime)}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <p className="text-sm text-gray-500">
                          {appointment.services.length} Services • ₹{appointment.totalPrice.toFixed(2)} • {appointment.paymentStatus}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleExpand(appointment._id)}
                    >
                      {appointment.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </Button>
                  </div>

                
      {/* ... [keep all your existing JSX until the expanded content] */}

      {appointment.isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-medium mb-2">{appointment.salon.salonName}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {appointment.serviceOption === 'home' 
              ? formatAddress(appointment.address)
              : formatAddress(appointment.salon.address)}
          </p>
          
          <div className="space-y-2 mb-3">
            {appointment.services.map((service) => (
              <div key={service._id} className="flex justify-between text-sm">
                <span>{service.name} ({service.duration} mins)</span>
                <span>₹{service.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm font-medium border-t pt-2">
            <span>Total</span>
            <span>₹{appointment.totalPrice.toFixed(2)}</span>
          </div>

          <div className="mt-3 text-sm">
            <p>Service Type: {appointment.serviceOption === 'home' ? 'At Home' : 'At Salon'}</p>
            <p>Payment Method: {appointment.paymentMethod}</p>
            <p>Payment Status: {appointment.paymentStatus}</p>
          </div>

          {/* Add Cancel Button */}
          {['pending', 'confirmed'].includes(appointment.status.toLowerCase()) && (
            <div className="mt-4">
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={()=>handleCancel(appointment._id)}
              >
                {loading ? "Processing..." : "Cancel Appointment"}
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                You can only cancel pending or confirmed appointments
              </p>
            </div>
          )}

          {appointment.status.toLowerCase() === 'cancelled' && (
            <p className="text-sm text-red-500 mt-3">
              This appointment has been cancelled
            </p>
          )}
        </div>
      )}
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            <div className="flex justify-center mt-4 space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    prev < totalPages ? prev + 1 : prev
                  )
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Appointments;