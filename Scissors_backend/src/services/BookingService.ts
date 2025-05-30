import {
  IAppointment,
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
} from "../Interfaces/Appointment/IAppointment";
import { ITimeSlotService } from "../Interfaces/TimeSlot/ITimeSlotService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { IOfferService } from "../Interfaces/Offers/IOfferService";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import Appointment from "../models/Appointment";
import mongoose from "mongoose";
import CustomError from "../Utils/cutsomError";
import Stripe from "stripe";
import { ISlotGroup } from "../Interfaces/TimeSlot/ITimeSlot";
import moment from "moment-timezone";
import { IBookingService } from "../Interfaces/Booking/IBookingService";

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

class BookingService implements IBookingService {
  private _timeSlotService: ITimeSlotService;
  private _salonService: ISalonService;
  private _offerService: IOfferService;
  private _reviewService: IReviewService;

  constructor(
    timeSlotService: ITimeSlotService,
    salonService: ISalonService,
    offerService: IOfferService,
    reviewService: IReviewService
  ) {
    this._timeSlotService = timeSlotService;
    this._salonService = salonService;
    this._offerService = offerService;
    this._reviewService = reviewService;
  }

  async getSalonDataWithSlots(
    salonId: string,
    serviceNames: string[] | undefined,
    stylistId: string | undefined,
    date: string | undefined
  ): Promise<SalonDataWithSlots> {
    console.log("getSalonDataWithSlots params:", {
      salonId,
      serviceNames,
      stylistId,
      date,
    });

    if (!salonId) {
      throw new CustomError(
        "Salon ID is required to fetch the salon data.",
        400
      );
    }

    const salonData = await this._salonService.getSalonData(salonId);
    if (!salonData) {
      throw new CustomError(
        "Salon not found. Please check the salon ID and try again.",
        404
      );
    }

    const reviews = await this._reviewService.getSalonReviews(salonId);
    const offers = await this._offerService.getSalonOffer(salonId);

    return {
      salonData,
      reviews,
      offers,
    };
  }

  async getServiceStylists(
    salonId: string,
    serviceIdsArray: string[]
  ): Promise<Stylist[]> {
    const salon = await this._salonService.getSalonData(salonId);
    if (!salon) {
      throw new CustomError("Salon not found", 404);
    }

    // Filter services by service.service
    const services = salon.services.filter((service: any) =>
      serviceIdsArray.includes(service._id.toString())
    );

    if (services.length === 0) {
      throw new CustomError(`No valid services found`, 404);
    }

    // Map service names to service IDs for validation
    const serviceIds = services.map((s: any) => s._id.toString());
    console.log("Mapped service IDs:", serviceIds);

    const stylistsMap = new Map<
      string,
      { _id: string; name: string; rating: number; serviceCount: number }
    >();
    services.forEach((service: any) => {
      service.stylists.forEach((stylist: any) => {
        const stylistId = stylist._id.toString();
        if (!stylistsMap.has(stylistId)) {
          stylistsMap.set(stylistId, {
            _id: stylistId,
            name: stylist.name,
            rating: stylist.rating,
            serviceCount: 0, // Initialize service count
          });
        }
        // Increment service count for this stylist
        const stylistData = stylistsMap.get(stylistId)!;
        stylistData.serviceCount += 1;
      });
    });

    // Filter stylists who offer ALL requested services
    const stylists = Array.from(stylistsMap.values()).filter(
      (stylist) => stylist.serviceCount === serviceIdsArray.length
    );

    console.log("Fetched Stylists:", stylists);

    if (stylists.length === 0) {
      throw new CustomError(
        "No stylists found who offer all selected services",
        404
      );
    }

    return stylists;
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;

          if (session.payment_status !== "paid") {
            console.warn(`Unpaid session: ${session.id}`);
            break;
          }

          if (!session.metadata) {
            throw new Error("Missing metadata in session");
          }

          console.log("Webhook metadata:", session.metadata);

          // Update all slots to "booked"
          const slotIds = JSON.parse(session.metadata.slotIds);
          await this._timeSlotService.updateSlotsStatus(slotIds, "booked");

          const appointmentData = await this.prepareAppointmentData(
            session.metadata,
            session
          );
          await Appointment.create([appointmentData], { session: dbSession });

          await dbSession.commitTransaction();
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      await dbSession.abortTransaction();
      throw new CustomError(error.message || "Webhook processing failed", 400);
    } finally {
      dbSession.endSession();
    }
  }

  private async prepareAppointmentData(
    metadata: any,
    session: Stripe.Checkout.Session
  ): Promise<IAppointment> {
    const requiredFields = ["user", "salon", "stylist", "services", "slotIds"];
    for (const field of requiredFields) {
      if (!metadata[field]) {
        throw new Error(`Missing required field in metadata: ${field}`);
      }
    }

    return {
      user: new mongoose.Types.ObjectId(metadata.user),
      salon: new mongoose.Types.ObjectId(metadata.salon),
      stylist: new mongoose.Types.ObjectId(metadata.stylist),
      services: metadata.services
        .split(",")
        .map((s: string) => new mongoose.Types.ObjectId(s)),
      slots: JSON.parse(metadata.slotIds).map(
        (id: string) => new mongoose.Types.ObjectId(id)
      ),
      status: AppointmentStatus.Confirmed,
      totalPrice: session.amount_total ? session.amount_total / 100 : 0,
      paymentStatus: PaymentStatus.paid,
      paymentMethod: PaymentMethod.Online,
      serviceOption: metadata.serviceOption === "home" ? "home" : "store",
      address:
        metadata.serviceOption === "home"
          ? JSON.parse(metadata.address)
          : undefined,
      stripeSessionId: session.id,
    } as IAppointment;
  }
}

export default BookingService;
