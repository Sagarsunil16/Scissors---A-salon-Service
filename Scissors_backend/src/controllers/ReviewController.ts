import { Request, Response, NextFunction } from "express";
import CustomError from "../Utils/cutsomError";
import mongoose from "mongoose";
import { IAppointmentService } from "../Interfaces/Appointment/IAppointmentService";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

class ReviewController {
  private _appointmentService: IAppointmentService;
  private _reviewService: IReviewService;

  constructor(appointmentService: IAppointmentService, reviewService: IReviewService) {
    this._appointmentService = appointmentService;
    this._reviewService = reviewService;
  }

  async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
      }

      const { salonId, stylistId, appointmentId, salonRating, salonComment, stylistRating, stylistComment } = req.body;
      console.log(req.body)
      if (!salonId || !appointmentId || !salonRating) {
        throw new CustomError(Messages.INVALID_REVIEW_DATA, HttpStatus.BAD_REQUEST);
      }
      if (!mongoose.Types.ObjectId.isValid(salonId) || !mongoose.Types.ObjectId.isValid(appointmentId) || (stylistId && !mongoose.Types.ObjectId.isValid(stylistId))) {
        throw new CustomError(Messages.INVALID_REVIEW_DATA, HttpStatus.BAD_REQUEST);
      }

      const review = await this._reviewService.createReview({
        userId: new mongoose.Types.ObjectId(userId),
        salonId,
        stylistId,
        appointmentId,
        salonRating,
        salonComment,
        stylistRating,
        stylistComment,
      });

      await this._appointmentService.updatedAppointmentReview(appointmentId);

      res.status(HttpStatus.OK).json({
        message: Messages.REVIEW_CREATED,
        review,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.CREATE_REVIEW_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getSalonReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.INVALID_SALON_ID, HttpStatus.BAD_REQUEST);
      }

      const reviews = await this._reviewService.getSalonReviews(id);

      res.status(HttpStatus.OK).json({
        message: Messages.SALON_REVIEWS_RETRIEVED,
        reviews,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_SALON_REVIEWS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getStylistReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.INVALID_STYLIST_ID, HttpStatus.BAD_REQUEST);
      }

      const reviews = await this._reviewService.getStylistReviews(id);

      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_REVIEWS_RETRIEVED,
        reviews,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_STYLIST_REVIEWS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default ReviewController;