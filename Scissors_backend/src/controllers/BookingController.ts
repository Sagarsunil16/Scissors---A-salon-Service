import { NextFunction, Request, Response } from "express";
import { ITimeSlotService } from "../Interfaces/TimeSlot/ITimeSlotService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { IOfferService } from "../Interfaces/Offers/IOfferService";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import { IBookingService } from "../Interfaces/Booking/IBookingService";
import CustomError from "../Utils/cutsomError";
import Stripe from "stripe";
import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";
import moment from "moment-timezone";
import mongoose from "mongoose";
import { ISlotGroup, ITimeSlot, ITimeSlotDocument } from "../Interfaces/TimeSlot/ITimeSlot";
import Salon from "../models/Salon";
import { IStylistService } from "../Interfaces/Stylist/IStylistService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

class BookingController {
  private _offerService: IOfferService;
  private _reviewService: IReviewService;
  private _timeSlotService: ITimeSlotService;
  private salonService: ISalonService;
  private _bookingService: IBookingService;
  private _stylistService: IStylistService;

  constructor(
    offerService: IOfferService,
    reviewService: IReviewService,
    timeSlotService: ITimeSlotService,
    salonService: ISalonService,
    bookingService: IBookingService,
    stylistService: IStylistService
  ) {
    this._offerService = offerService;
    this._reviewService = reviewService;
    this._timeSlotService = timeSlotService;
    this.salonService = salonService;
    this._bookingService = bookingService;
    this._stylistService = stylistService;
    this.webHooks = this.webHooks.bind(this);
  }

  async getSalonDataWithSlots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: salonId, serviceIds, stylistIds, date } = req.query;

      if (!salonId || typeof salonId !== "string") {
        throw new CustomError("Salon ID is required", HttpStatus.BAD_REQUEST);
      }

      const serviceIdsArray =
        typeof serviceIds === "string" ? serviceIds.split(",") : [];

      const salon = await this.salonService.getSalonData(salonId);
      if (!salon) {
        throw new CustomError("Salon not found", HttpStatus.NOT_FOUND);
      }

      const response = await this._bookingService.getSalonDataWithSlots(
        salonId,
        serviceIdsArray,
        stylistIds as string,
        date as string
      );

      console.log("getSalonDataWithSlots response:", {
        salonId,
        reviewsCount: response.reviews.length,
        offersCount: response.offers.length,
      });

      res.status(HttpStatus.OK).json({
        message: "Salon data fetched successfully",
        salonData: response.salonData,
        reviews: response.reviews,
        offers: response.offers,
      });
    } catch (error: any) {
      console.error("Error in getSalonDataWithSlots:", {
        salonId: req.query.id,
        serviceNames: req.query.serviceNames,
        stylistIds: req.query.stylistIds,
        error,
      });
      if (error.statusCode === HttpStatus.BAD_REQUEST) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { salonId, stylistId, selectedDate, serviceIds } = req.body;
      if (!salonId || !stylistId || !selectedDate || !serviceIds?.length) {
        throw new CustomError("Missing required parameters", HttpStatus.BAD_REQUEST);
      }

      const salon = await this.salonService.getSalonData(salonId);
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

      const timeZone = salon.timeZone || 'Asia/Kolkata';
      const date = moment.tz(selectedDate, 'YYYY-MM-DD', timeZone).startOf("day").toDate();
      console.log(`Parsed date for slot query: ${moment(date).tz(timeZone).format('YYYY-MM-DD HH:mm:ss Z')}`);

      const slotGroups: ISlotGroup[] = await this._timeSlotService.findAvailableSlots(
        salonId,
        serviceIds,
        date,
        stylistId
      );

      const totalDuration = salon.services
        .filter((s: any) => serviceIds.includes(s._id.toString()))
        .reduce((sum: number, s: any) => sum + (s.duration || 30), 0);

      console.log(`Found ${slotGroups.length} slot groups for ${totalDuration} minutes`);

      const formattedSlotGroups = slotGroups.map(group => ({
        _id: group._id,
        slotIds: group.slotIds,
        startTime: moment(group.startTime).tz(timeZone).toISOString(),
        endTime: moment(group.endTime).tz(timeZone).toISOString(),
        duration: group.duration
      }));

      res.status(HttpStatus.OK).json({
        message: "Available slot groups fetched successfully",
        slotGroups: formattedSlotGroups,
        totalDuration
      });
    } catch (error: any) {
      console.error("Error in getAvailableSlots:", error);
      if (error.statusCode === HttpStatus.BAD_REQUEST || error.statusCode === HttpStatus.NOT_FOUND) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async getServiceStylists(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { salonId } = req.params;
      const { serviceIds } = req.query;

      const serviceIdsArray =
        typeof serviceIds === "string" ? serviceIds.split(",") : [];
      const stylists = await this._bookingService.getServiceStylists(
        salonId,
        serviceIdsArray
      );
      res
        .status(HttpStatus.OK)
        .json({ message: Messages.STYLISTS_FETCHED, stylists });
    } catch (error: any) {
      console.error("Error in getServiceStylists:", error);
      if (error.statusCode === HttpStatus.BAD_REQUEST) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { salonId, stylistId, serviceIds, slotIds, startTime, endTime } = req.body;

      console.log(slotIds, serviceIds);
      
      if (!salonId || !stylistId || !serviceIds?.length || !slotIds?.length || !startTime || !endTime) {
        throw new CustomError("Missing required parameters", HttpStatus.BAD_REQUEST);
      }

      const salon = await this.salonService.getSalonData(salonId);
      if (!salon) {
        throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Validate services and stylist
      const validServices = salon.services.filter((service: any) =>
        serviceIds.includes(service._id.toString()) &&
        service.stylists.some((s: any) => s._id.toString() === stylistId)
      );
      if (validServices.length !== serviceIds.length) {
        throw new CustomError("Invalid services or stylist-service mismatch", HttpStatus.BAD_REQUEST);
      }

      // Verify total duration
      const totalDuration = validServices.reduce((sum: number, service: any) => sum + (service.duration || 30), 0);
      const slotDuration = slotIds.length * 30;
      if (slotDuration < totalDuration) {
        throw new CustomError("Selected slots do not cover service duration", HttpStatus.BAD_REQUEST);
      }

      // Reserve slots temporarily
      const reservedUntil = moment().add(15, 'minutes').toDate();
      await this._timeSlotService.reserveSlotGroup(slotIds, reservedUntil);

      res.status(HttpStatus.OK).json({
        message: "Slots reserved successfully",
        reservation: {
          slotIds,
          startTime,
          endTime,
          reservedUntil: reservedUntil.toISOString()
        }
      });
    } catch (error: any) {
      console.error("Error in createBooking:", error);
      if (error.statusCode === HttpStatus.BAD_REQUEST || error.statusCode === HttpStatus.NOT_FOUND || error.statusCode === HttpStatus.CONFLICT) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async createCheckoutSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { amount, currency, metadata, reservedUntil: prevReservedUntil } = req.body;

      if (
        !amount ||
        !currency ||
        !metadata ||
        !metadata.slotIds ||
        !metadata.services ||
        !prevReservedUntil
      ) {
        throw new CustomError(
          Messages.INVALID_CHECKOUT_DATA,
          HttpStatus.BAD_REQUEST
        );
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const slotIds = Array.isArray(metadata.slotIds)
          ? metadata.slotIds
          : JSON.parse(metadata.slotIds);

        // Check slot reservation
        const slots = await this._timeSlotService.getSlotsByIds(slotIds);
        const now = new Date();
        if (slots.length !== slotIds.length) {
          throw new CustomError("One or more slots not found", HttpStatus.NOT_FOUND);
        }
        if (slots.some(slot => slot.status === 'booked')) {
          throw new CustomError("One or more slots are already booked", HttpStatus.BAD_REQUEST);
        }
        const prevReservedUntilDate = new Date(prevReservedUntil);
        if (slots.some(slot => !slot.reservedUntil || slot.reservedUntil < now || slot.reservedUntil.toISOString() !== prevReservedUntilDate.toISOString())) {
          throw new CustomError("Slot reservation invalid or expired", HttpStatus.BAD_REQUEST);
        }

        // Extend reservation
        const newReservedUntil = new Date(Date.now() + 10 * 60 * 1000);
        await this._timeSlotService.reserveSlotGroup(slotIds, newReservedUntil);

        const lineItems = [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: "Salon Booking Payment",
                description: `Payment for services: ${metadata.services}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ];

        const stripeSession = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: process.env.SUCCESS_URL || "http://localhost:5173/booking-success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: process.env.CANCEL_URL || "http://localhost:5173/booking-confirmation",
          metadata: { ...metadata, slotIds: JSON.stringify(slotIds) },
        });

        await session.commitTransaction();
        res.status(HttpStatus.OK).json({
          message: Messages.CHECKOUT_SESSION_CREATED,
          id: stripeSession.id,
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error: any) {
      console.error("Error in createCheckoutSession:", {
        error
      });
      if (error.statusCode) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async webHooks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new CustomError(
        Messages.WEBHOOK_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        endpointSecret
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    try {
      await this._bookingService.handleWebhookEvent(event);
      res.status(HttpStatus.OK).send();
    } catch (error: any) {
      console.error("Error in webHooks:", error);
      next(error);
    }
  }
}

export default BookingController;