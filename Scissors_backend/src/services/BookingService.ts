import {IAppointment,AppointmentStatus,PaymentMethod,PaymentStatus, IAppointmentDocument} from "../Interfaces/Appointment/IAppointment";
import { ITimeSlotService } from "../Interfaces/TimeSlot/ITimeSlotService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { IOfferService } from "../Interfaces/Offers/IOfferService";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import Appointment from "../models/Appointment";
import mongoose, { mongo } from "mongoose";
import CustomError from "../Utils/cutsomError";
import Stripe from "stripe";
import moment from "moment-timezone";
import { IBookingService, ReservationData } from "../Interfaces/Booking/IBookingService";
import { HttpStatus } from "../constants/HttpStatus";
import { IAppointmentService } from "../Interfaces/Appointment/IAppointmentService";
import { IWalletService } from "../Interfaces/Wallet/IWalletService";
import { Messages } from "../constants/Messages";
import { ISlotGroup } from "../Interfaces/TimeSlot/ITimeSlot";
import { nanoid } from "../Utils/nano";

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
  private _appointmentService: IAppointmentService;
  private _walletService: IWalletService;

  constructor(
    timeSlotService: ITimeSlotService,
    salonService: ISalonService,
    offerService: IOfferService,
    reviewService: IReviewService,
    appointmentService: IAppointmentService,
    walletService: IWalletService
  ) {
    this._timeSlotService = timeSlotService;
    this._salonService = salonService;
    this._offerService = offerService;
    this._reviewService = reviewService;
    this._appointmentService = appointmentService;
    this._walletService = walletService;
  }

  async getSalonDataWithSlots(
    salonId: string,
    serviceIds?: string[],
    stylistId?: string,
    date?: string
  ): Promise<SalonDataWithSlots> {
    if (!salonId) {
      throw new CustomError("Salon ID is required", HttpStatus.BAD_REQUEST);
    }

    const salon = await this._salonService.getSalonData(salonId);
    if (!salon) {
      throw new CustomError("Salon not found", HttpStatus.NOT_FOUND);
    }
    console.log(salon,"salonsssdata")
    const reviews = await this._reviewService.getSalonReviews(salonId);
    const offers = await this._offerService.getSalonOffer(salonId);

    return {
      salonData: salon,
      reviews,
      offers,
    };
  }

  async getServiceStylists(salonId: string, serviceIds: string[], selectedDate?: string): Promise<Stylist[]> {
    if (!salonId) {
      throw new CustomError("Salon ID is required", HttpStatus.BAD_REQUEST);
    }
    if (!serviceIds || !Array.isArray(serviceIds)) {
      throw new CustomError("Service IDs are required and must be an array", HttpStatus.BAD_REQUEST);
    }

    const salon = await this._salonService.getSalonData(salonId);
    if (!salon) {
      throw new CustomError("Salon not found", HttpStatus.NOT_FOUND);
    }

    const services = salon.services.filter((service: any) =>
      serviceIds.includes(service._id.toString())
    );

    if (services.length === 0) {
      throw new CustomError("No valid services found", HttpStatus.NOT_FOUND);
    }

     const selectedDay = selectedDate
    ? moment(selectedDate).format("dddd")
    : null;

    const stylistsMap = new Map<
      string,
      { _id: string; name: string; rating: number; serviceCount: number, workingHours: any[] }
    >();
    services.forEach((service: any) => {
      service.stylists.forEach((stylist: any) => {
        const stylistId = stylist._id.toString();
        if (!stylistsMap.has(stylistId)) {
          stylistsMap.set(stylistId, {
            _id: stylistId,
            name: stylist.name,
            rating: stylist.rating,
            serviceCount: 0,
            workingHours: stylist.workingHours,
          });
        }
        const stylistData = stylistsMap.get(stylistId)!;
        stylistData.serviceCount += 1;
      });
    });

    let stylists = Array.from(stylistsMap.values()).filter(
      (stylist) => stylist.serviceCount === serviceIds.length
    );

    if (selectedDay) {
    stylists = stylists.filter((stylist) =>
      stylist.workingHours.some(
        (wh) => wh.day.toLowerCase() === selectedDay.toLowerCase()
      )
    );
  }

    console.log(selectedDay,"Selected day",
    console.log(stylists,"stylists")
  )

    if (stylists.length === 0) {
      throw new CustomError(
        "No stylists found who offer all selected services",
        HttpStatus.NOT_FOUND
      );
    }

    return stylists;
  }

  async getAvailableSlots(
    salonId: string,
    stylistId: string,
    selectedDate: string,
    serviceIds: string[]
  ): Promise<{ slotGroups: any[]; totalDuration: number }> {
    if (!salonId || !stylistId || !selectedDate || !serviceIds?.length) {
      throw new CustomError("Missing required parameters", HttpStatus.BAD_REQUEST);
    }

    const salon = await this._salonService.getSalonData(salonId);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const stylistExists = salon.services.some((service: any) =>
      service.stylists.some((s: any) => s._id.toString() === stylistId)
    );
    if (!stylistExists) {
      throw new CustomError(
        "Stylist does not belong to this salon",
        HttpStatus.BAD_REQUEST
      );
    }

    const timeZone = salon.timeZone || "Asia/Kolkata";
    const date = moment.tz(selectedDate, "YYYY-MM-DD", timeZone).startOf("day").toDate();

    const slotGroups: ISlotGroup[] = await this._timeSlotService.findAvailableSlots(
      salonId,
      serviceIds,
      date,
      stylistId
    );

    const totalDuration = salon.services
      .filter((s: any) => serviceIds.includes(s._id.toString()))
      .reduce((sum: number, s: any) => sum + (s.duration || 30), 0);

    const formattedSlotGroups = slotGroups.map(group => ({
      _id: group._id,
      slotIds: group.slotIds,
      startTime: moment(group.startTime).tz(timeZone).toISOString(),
      endTime: moment(group.endTime).tz(timeZone).toISOString(),
      duration: group.duration
    }));

    return {
      slotGroups: formattedSlotGroups,
      totalDuration
    };
  }

  async createBooking(
    userId: string,
    bookingData: {
      salonId: string;
      stylistId: string;
      serviceIds: string[]
      slotIds: string[];
      startTime: string;
      endTime: string;
      paymentMethod: PaymentMethod;
      serviceOption: string;
      address?: any;
    }
  ): Promise<{ appointment?: IAppointmentDocument; reservation?: ReservationData }> {
    if (!userId) {
      throw new CustomError(
        Messages.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      );
    }

    const {
      salonId,
      stylistId,
      serviceIds,
      slotIds,
      startTime,
      endTime,
      paymentMethod,
      serviceOption,
      address,
    } = bookingData;

    if (
      !salonId ||
      !stylistId ||
      !serviceIds?.length ||
      !slotIds?.length ||
      !startTime ||
      !endTime ||
      !paymentMethod ||
      !serviceOption
    ) {
      throw new CustomError("Missing required parameters", HttpStatus.BAD_REQUEST);
    }

    if (serviceOption !== "home" && serviceOption !== "store") {
      throw new CustomError(
        "Service option must be 'home' or 'store'",
        HttpStatus.BAD_REQUEST
      );
    }


    const salon = await this._salonService.getSalonData(salonId);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const validServices = salon.services.filter(
      (service: any) =>
        serviceIds.includes(service._id.toString()) &&
        service.stylists.some((s: any) => s._id.toString() === stylistId)
    );
    if (validServices.length !== serviceIds.length) {
      throw new CustomError(
        "Invalid services or stylist-service mismatch",
        HttpStatus.BAD_REQUEST
      );
    }

    const totalDuration = validServices.reduce(
      (sum: number, service: any) => sum + (service.duration || 30),
      0
    );
    let totalPrice = validServices.reduce(
      (sum: number, service: any) => sum + (service.price || 0),
      0
    );
    if (serviceOption === "home") {
      totalPrice += 99;
    }

    const slotDuration = slotIds.length * 30;
    if (slotDuration < totalDuration) {
      throw new CustomError(
        "Selected slots do not cover service duration",
        HttpStatus.BAD_REQUEST
      );
    }

    const bookingId = nanoid();

     const serviceObjectIds = serviceIds.map(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(`Invalid service ID: ${id}`, HttpStatus.BAD_REQUEST);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const slotObjectIds = slotIds.map(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(`Invalid slot ID: ${id}`, HttpStatus.BAD_REQUEST);
      }
      return new mongoose.Types.ObjectId(id);
    });

    if (paymentMethod === "wallet") {
      const walletBalance = await this._walletService.getBalance(userId);
      if (walletBalance < totalPrice) {
        throw new CustomError(
          "Insufficient wallet balance",
          HttpStatus.BAD_REQUEST
        );
      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const transaction = await this._walletService.debitWallet(
          userId,
          totalPrice,
          undefined,
          `Payment for booking at ${salon.salonName}`
        );

        await this._timeSlotService.updateSlotsStatus(slotIds, "booked");

        const appointmentData = {
          user: new mongoose.Types.ObjectId(userId),
          salon: new mongoose.Types.ObjectId(salonId),
          stylist: new mongoose.Types.ObjectId(stylistId),
          services: serviceObjectIds,
          slots: slotObjectIds,
          status: AppointmentStatus.Confirmed,
          totalPrice,
          paymentStatus: PaymentStatus.Paid,
          paymentMethod: PaymentMethod.Wallet,
          serviceOption: serviceOption as "home" | "store",
          address: serviceOption === "home" ? address : undefined,
          walletTransaction: transaction._id as mongoose.Types.ObjectId,
          bookingId,
        };
        const appointment = await this._appointmentService.createAppointment(
          appointmentData,
          session
        );

        await session.commitTransaction();
        return { appointment };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const reservedUntil = moment().add(15, "minutes").toDate();
        await this._timeSlotService.reserveSlotGroup(
          slotIds,
          reservedUntil,
          bookingId,
          userId,
          session
        );

        await session.commitTransaction();
        return {
          reservation: {
            slotIds,
            startTime,
            endTime,
            reservedUntil: reservedUntil.toISOString(),
            totalPrice,
            paymentMethod,
            bookingId,
            salonId,
            stylistId,
            serviceIds,
            serviceOption,
            address: serviceOption === "home" ? address : undefined,
          },
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  }

  async createCheckoutSession(
    userId: string,
    checkoutData: {
      amount: number;
      currency: string;
      metadata: any;
      reservedUntil: string;
      bookingId: string;
    }
  ): Promise<{ id?: string; bookingId?: string; appointmentId?: string }> {
    const { amount, currency, metadata, reservedUntil: prevReservedUntil, bookingId } = checkoutData;

    if (!userId) {
      throw new CustomError(
        Messages.AUTHENTICATION_REQUIRED,
        HttpStatus.UNAUTHORIZED
      );
    }

    if (
      !amount ||
      !currency ||
      !metadata ||
      !metadata.slotIds ||
      !metadata.serviceIds ||
      !metadata.userId ||
      !metadata.stylistId ||
      !metadata.salonId ||
      !prevReservedUntil ||
      !bookingId
    ) {
      throw new CustomError(
        Messages.INVALID_CHECKOUT_DATA,
        HttpStatus.BAD_REQUEST
      );
    }

    if (typeof metadata.services !== "string") {
      throw new CustomError(
        "Services metadata must be a string",
        HttpStatus.BAD_REQUEST
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const slotIds = Array.isArray(metadata.slotIds)
        ? metadata.slotIds
        : JSON.parse(metadata.slotIds);

      const slots = await this._timeSlotService.getSlotsByIds(slotIds);
      const now = new Date();
      if (!slots.length || slots.length !== slotIds.length) {
        throw new CustomError("One or more slots not found", HttpStatus.NOT_FOUND);
      }
      if (slots.some((slot) => slot.status === "booked")) {
        throw new CustomError(
          "One or more slots are already booked",
          HttpStatus.BAD_REQUEST
        );
      }

      const prevReservedUntilDate = new Date(prevReservedUntil);
      const invalidSlots = slots.filter(
        (slot) => {
          const timeDiff = slot.reservedUntil ? Math.abs(slot.reservedUntil.getTime() - prevReservedUntilDate.getTime()) : Infinity;
          return (
            !slot.reservedUntil ||
            slot.reservedUntil < now ||
            timeDiff > 5000 ||
            slot.bookingId !== bookingId ||
            slot.userId?.toString() !== metadata.userId
          );
        }
      );
      if (invalidSlots.length) {
        throw new CustomError(
          "Slot reservation invalid or expired",
          HttpStatus.BAD_REQUEST
        );
      }

      const newReservedUntil = new Date(Date.now() + 10 * 60 * 1000);
      await this._timeSlotService.reserveSlotGroup(
        slotIds,
        newReservedUntil,
        bookingId,
        metadata.userId,
        session
      );

      if (metadata.paymentMethod === "cash") {
        const appointmentData = {
          user: new mongoose.Types.ObjectId(metadata.userId),
          salon: new mongoose.Types.ObjectId(metadata.salonId),
          stylist: new mongoose.Types.ObjectId(metadata.stylistId),
          services: metadata.serviceIds,
          slots: slotIds,
          status: AppointmentStatus.Confirmed,
          totalPrice: amount,
          paymentStatus: PaymentStatus.Pending,
          paymentMethod: PaymentMethod.Cash,
          serviceOption: metadata.serviceOption,
          address: metadata.address ? JSON.parse(metadata.address) : undefined,
          bookingId,
        };
        const appointment = await this._appointmentService.createAppointment(
          appointmentData,
          session
        );

        await this._timeSlotService.updateSlotsStatus(slotIds, "booked");
        await session.commitTransaction();
        return {
          bookingId,
          appointmentId: (appointment._id as mongoose.Types.ObjectId).toString(),
        };
      }

      const line_items = [
        {
          price_data: {
            currency,
            product_data: {
              name: "Salon Booking",
              description: `Payment for services: ${metadata.services}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ];

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: process.env.SUCCESS_URL || "http://localhost:5173/booking-success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: process.env.CANCEL_URL || "http://localhost:5173/booking-confirmation",
        metadata: {
          ...metadata,
          slotIds: JSON.stringify(slotIds),
          bookingId,
          serviceIds: JSON.stringify(metadata.serviceIds),
        },
      });

      await session.commitTransaction();
      return {
        id: stripeSession.id,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
              throw new CustomError(
                `Missing required field in metadata: ${field}`,
                HttpStatus.BAD_REQUEST
              );
            }
          }

          let slotIds: string[];
          try {
            slotIds = JSON.parse(session.metadata.slotIds);
          } catch (error) {
            throw new CustomError("Invalid slotIds format", HttpStatus.BAD_REQUEST);
          }
          const slots = await this._timeSlotService.getSlotsByIds(slotIds);
          if (slots.length !== slotIds.length) {
            throw new CustomError("One or more slots not found", HttpStatus.NOT_FOUND);
          }
          if (slots.some((slot) => slot.status === "booked")) {
            throw new CustomError("One or more slots are already booked", HttpStatus.BAD_REQUEST);
          }
          if (slots.some((slot) => slot.bookingId !== session.metadata?.bookingId)) {
            throw new CustomError("Slot booking ID mismatch", HttpStatus.BAD_REQUEST);
          }

          const appointmentData = await this.prepareAppointmentData(session.metadata, session);
          await Appointment.create([appointmentData], { session: dbSession });
          await this._timeSlotService.updateSlotsStatus(slotIds, "booked");

          await dbSession.commitTransaction();
          break;

        case "payment_intent.succeeded":
        case "charge.succeeded":
        case "charge.updated":
        case "payment_intent.created":
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      await dbSession.abortTransaction();
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
        throw new CustomError(`Missing required field in metadata: ${field}`, HttpStatus.BAD_REQUEST);
      }
    }

    let serviceIds: string[];
    let slotIds: string[];
    try {
      serviceIds = JSON.parse(metadata.serviceIds);
      slotIds = JSON.parse(metadata.slotIds);
    } catch (error) {
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
