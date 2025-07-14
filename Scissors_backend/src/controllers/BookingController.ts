import { NextFunction, Request, Response } from "express";
import { IBookingService } from "../Interfaces/Booking/IBookingService";
import CustomError from "../Utils/cutsomError";
import Stripe from "stripe";
import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
interface AuthenticatedRequest extends Request{
  user?:{
    id:string
  }
}
class BookingController {
  private _bookingService: IBookingService;

  constructor(bookingService: IBookingService) {
    this._bookingService = bookingService;
    this.webHooks = this.webHooks.bind(this);
  }

  async getSalonDataWithSlots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: salonId, serviceIds, stylistIds, date } = req.query;

      const serviceIdsArray =
        typeof serviceIds === "string" ? serviceIds.split(",") : [];

      const response = await this._bookingService.getSalonDataWithSlots(
        salonId as string,
        serviceIdsArray,
        stylistIds as string,
        date as string
      );
      console.log(response,"salon details")
      res.status(HttpStatus.OK).json({
        message: "Salon data fetched successfully",
        salonData: response.salonData,
        reviews: response.reviews,
        offers: response.offers,
      });
    } catch (error: any) {
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

      const response = await this._bookingService.getAvailableSlots(
        salonId,
        stylistId,
        selectedDate,
        serviceIds
      );

      res.status(HttpStatus.OK).json({
        message: "Available slot groups fetched successfully",
        slotGroups: response.slotGroups,
        totalDuration: response.totalDuration,
      });
    } catch (error: any) {
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
      if (error.statusCode === HttpStatus.BAD_REQUEST) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
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
      } = req.body;
      const userId = req.user?.id;

      const result = await this._bookingService.createBooking(userId as string, {
        salonId,
        stylistId,
        serviceIds,
        slotIds,
        startTime,
        endTime,
        paymentMethod,
        serviceOption,
        address,
      });

      if (result.appointment) {
        res.status(HttpStatus.OK).json({
          message: "Booking created successfully",
          appointment: result.appointment,
        });
      } else {
        res.status(HttpStatus.OK).json({
          message: "Slots reserved successfully",
          reservation: result.reservation,
        });
      }
    } catch (error: any) {
      if (
        error.statusCode === HttpStatus.BAD_REQUEST ||
        error.statusCode === HttpStatus.NOT_FOUND ||
        error.statusCode === HttpStatus.CONFLICT
      ) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async createCheckoutSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { amount, currency, metadata, reservedUntil, bookingId } = req.body;
      const userId = req.user?.id;

      const result = await this._bookingService.createCheckoutSession(userId as string, {
        amount,
        currency,
        metadata,
        reservedUntil,
        bookingId,
      });

      if (result.appointmentId) {
        res.status(HttpStatus.OK).json({
          message: "Booking confirmed for cash payment",
          bookingId: result.bookingId,
          appointmentId: result.appointmentId,
        });
      } else {
        res.status(HttpStatus.OK).json({
          message: Messages.CHECKOUT_SESSION_CREATED,
          id: result.id,
        });
      }
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async webHooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  console.log("✅ Stripe Webhook called!");
  const sig = req.headers["stripe-signature"];
  console.log("🔐 Signature:", sig);
  console.log("📦 Full Raw body:", req.body.toString());
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log("Stripe Webhook Secret:", endpointSecret);
  console.log("Is raw buffer?", Buffer.isBuffer(req.body));

  if (!endpointSecret) {
    throw new CustomError(
      Messages.WEBHOOK_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  if (!sig) {
    throw new CustomError(
      "Missing stripe-signature header",
      HttpStatus.BAD_REQUEST
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
    console.log("Received event:", event.type, "Event ID:", event.id);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    console.error("Request headers:", JSON.stringify(req.headers, null, 2));
    res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${error.message}`);
    return;
  }

  try {
    await this._bookingService.handleWebhookEvent(event);
    res.status(HttpStatus.OK).send();
  } catch (error: any) {
    console.error("Error handling webhook event:", error.message);
    next(error);
  }
}
}

export default BookingController;