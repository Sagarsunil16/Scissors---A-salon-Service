import { Stripe } from "stripe";
import { IAppointmentDocument } from "../Appointment/IAppointment";

interface SalonDataWithSlots {
  salonData: any;
  reviews: any[];
  offers: any[];
}

interface Stylist {
  _id: string;
  name: string;
  rating: number;
}

export interface ReservationData {
  slotIds: string[];
  startTime: string;
  endTime: string;
  reservedUntil: string;
  totalPrice: number;
  paymentMethod: string;
  bookingId: string;
  salonId: string;
  stylistId: string;
  serviceIds: string[];
  serviceOption: string;
  address?: any;
}
export interface IBookingService {
  getSalonDataWithSlots(
    salonId: string,
    serviceIds?: string[],
    stylistId?: string,
    date?: string
  ): Promise<SalonDataWithSlots>;
  getServiceStylists(salonId: string, serviceIds: string[], selectedDate?: string): Promise<Stylist[]>;
  handleWebhookEvent(event: Stripe.Event): Promise<void>;
  getAvailableSlots(
    salonId: string,
    stylistId: string,
    selectedDate: string,
    serviceIds: string[]
  ): Promise<{ slotGroups: any[]; totalDuration: number }>;
  createBooking(
    userId: string,
    bookingData: {
      salonId: string;
      stylistId: string;
      serviceIds: string[];
      slotIds: string[];
      startTime: string;
      endTime: string;
      paymentMethod: string;
      serviceOption: string;
      address?: any;
    }
  ): Promise<{ appointment?: IAppointmentDocument; reservation?: ReservationData }>;
  createCheckoutSession(
    userId: string,
    checkoutData: {
      amount: number;
      currency: string;
      metadata: any;
      reservedUntil: string;
      bookingId: string;
    }
  ): Promise<{ id?: string; bookingId?: string; appointmentId?: string }>;
}