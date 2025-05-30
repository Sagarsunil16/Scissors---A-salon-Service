import { Stripe } from "stripe";
import { ISlotGroup } from "../TimeSlot/ITimeSlot";

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

export interface IBookingService {
  getSalonDataWithSlots(
    salonId: string,
    serviceIds: string[] | undefined,
    stylistId: string | undefined,
    date: string | undefined
  ): Promise<SalonDataWithSlots>;
  getServiceStylists(salonId: string, serviceIds: string[]): Promise<Stylist[]>;
  handleWebhookEvent(event: Stripe.Event): Promise<void>;
}