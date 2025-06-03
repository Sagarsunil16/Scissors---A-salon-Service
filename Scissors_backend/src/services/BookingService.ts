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
import { HttpStatus } from "../constants/HttpStatus";

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
    console.log(`Handling webhook event: ${event.type}`);
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.payment_status !== "paid") {
            console.warn(`Unpaid session: ${session.id}`);
            await dbSession.commitTransaction();
            return;
          }

          if (!session.metadata) {
            throw new CustomError("Missing metadata in session", HttpStatus.BAD_REQUEST);
          }

          console.log("Webhook metadata:", session.metadata);

          // Validate metadata
          const requiredFields = [
            "userId",
            "salonId",
            "stylistId",
            "serviceIds",
            "slotIds",
            "bookingId",
            "services",
            "paymentMethod",
            "serviceOption",
          ];
          for (const field of requiredFields) {
            if (!session.metadata[field]) {
              console.error(`Missing metadata field: ${field}`);
              throw new CustomError(
                `Missing required field in metadata: ${field}`,
                HttpStatus.BAD_REQUEST
              );
            }
          }

          // Validate slots
          let slotIds: string[];
          try {
            slotIds = JSON.parse(session.metadata.slotIds);
          } catch (error) {
            console.error("Failed to parse slotIds:", error);
            throw new CustomError("Invalid slotIds format", HttpStatus.BAD_REQUEST);
          }
          const slots = await this._timeSlotService.getSlotsByIds(slotIds);
          if (slots.length !== slotIds.length) {
            console.error("Slot count mismatch:", { expected: slotIds.length, found: slots.length });
            throw new CustomError("One or more slots not found", HttpStatus.NOT_FOUND);
          }
          if (slots.some((slot) => slot.status === "booked")) {
            console.error("Booked slots detected:", slots);
            throw new CustomError("One or more slots are already booked", HttpStatus.BAD_REQUEST);
          }
          if (slots.some((slot) => slot.bookingId !== session.metadata?.bookingId)) {
            console.error("Booking ID mismatch:", slots);
            throw new CustomError("Slot booking ID mismatch", HttpStatus.BAD_REQUEST);
          }

          const appointmentData = await this.prepareAppointmentData(session.metadata, session);
          await Appointment.create([appointmentData], { session: dbSession });
          await this._timeSlotService.updateSlotsStatus(slotIds, "booked");

          await dbSession.commitTransaction();
          console.log(`Appointment created for booking ${session.metadata.bookingId}`);
          break;

        case "payment_intent.succeeded":
          console.log(`Payment intent succeeded: ${event.data.object.id}`);
          break;

        case "charge.succeeded":
        case "charge.updated":
        case "payment_intent.created":
          console.log(`Processed event: ${event.type}, ID: ${event.data.object.id}`);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      await dbSession.abortTransaction();
      console.error("Webhook error:", error);
      throw new CustomError(error.message || "Webhook processing failed", HttpStatus.BAD_REQUEST);
    } finally {
      dbSession.endSession();
    }
  }

  private async prepareAppointmentData(
    metadata: any,
    session: Stripe.Checkout.Session
  ): Promise<IAppointment> {
    const requiredFields = [
      "userId",
      "salonId",
      "stylistId",
      "serviceIds",
      "slotIds",
      "bookingId",
      "services",
      "paymentMethod",
      "serviceOption",
    ];
    for (const field of requiredFields) {
      if (!metadata[field]) {
        console.error(`Missing metadata field: ${field}`);
        throw new CustomError(`Missing required field in metadata: ${field}`, HttpStatus.BAD_REQUEST);
      }
    }

    let serviceIds: string[];
    let slotIds: string[];
    try {
      serviceIds = JSON.parse(metadata.serviceIds);
      slotIds = JSON.parse(metadata.slotIds);
    } catch (error) {
      console.error("Failed to parse serviceIds or slotIds:", error);
      throw new CustomError("Invalid serviceIds or slotIds format", HttpStatus.BAD_REQUEST);
    }

    return {
      user: new mongoose.Types.ObjectId(metadata.userId),
      salon: new mongoose.Types.ObjectId(metadata.salonId),
      stylist: new mongoose.Types.ObjectId(metadata.stylistId),
      services: serviceIds.map((id: string) => new mongoose.Types.ObjectId(id)),
      slots: slotIds.map((id: string) => new mongoose.Types.ObjectId(id)),
      status: AppointmentStatus.Confirmed,
      totalPrice: session.amount_total ? session.amount_total / 100 : 0,
      paymentStatus: PaymentStatus.Paid,
      paymentMethod: metadata.paymentMethod === "online" ? PaymentMethod.Online : PaymentMethod.Cash,
      serviceOption: metadata.serviceOption === "home" ? "home" : "store",
      address: metadata.serviceOption === "home" && metadata.address ? JSON.parse(metadata.address) : undefined,
      stripeSessionId: session.id,
      bookingId: metadata.bookingId,
    } as IAppointment;
  }
}

export default BookingService;
