import { IReview, IReviewDocument } from "../Interfaces/Reviews/IReview";
import { IReviewRepository } from "../Interfaces/Reviews/IReviewRepository";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import { IAppointmentService } from "../Interfaces/Appointment/IAppointmentService";
import CustomError from "../Utils/cutsomError";
import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";
import mongoose from "mongoose";

class ReviewService implements IReviewService {
  private _reviewRepository: IReviewRepository;
  private _appointmentService: IAppointmentService;

  constructor(repository: IReviewRepository, appointmentService: IAppointmentService) {
    this._reviewRepository = repository;
    this._appointmentService = appointmentService;
  }

  async createReview(userId: string | undefined, reviewData: Partial<IReview>): Promise<IReviewDocument> {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const { salonId, stylistId, appointmentId, salonRating, salonComment, stylistRating, stylistComment } = reviewData;
    if (!salonId || !appointmentId || salonRating == null) {
      throw new CustomError(Messages.INVALID_REVIEW_DATA, HttpStatus.BAD_REQUEST);
    }
    if (
      !mongoose.Types.ObjectId.isValid(salonId) ||
      !mongoose.Types.ObjectId.isValid(appointmentId) ||
      (stylistId && !mongoose.Types.ObjectId.isValid(stylistId))
    ) {
      throw new CustomError(Messages.INVALID_REVIEW_DATA, HttpStatus.BAD_REQUEST);
    }
    if (salonRating < 1 || salonRating > 5 || (stylistRating && (stylistRating < 1 || stylistRating > 5))) {
      throw new CustomError(Messages.INVALID_RATING_RANGE, HttpStatus.BAD_REQUEST);
    }

    const appointment = await this._reviewRepository.findAppointmentById(appointmentId.toString());
    if (!appointment) {
      throw new CustomError(Messages.APPOINTMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (appointment.status !== "completed") {
      throw new CustomError(Messages.REVIEW_NOT_ALLOWED, HttpStatus.BAD_REQUEST);
    }
    if (appointment.user.toString() !== userId) {
      throw new CustomError(Messages.UNAUTHORIZED_REVIEW, HttpStatus.FORBIDDEN);
    }

    const existingReview = await this._reviewRepository.findReviewByAppointmentId(appointmentId.toString());
    if (existingReview) {
      throw new CustomError(Messages.REVIEW_ALREADY_SUBMITTED, HttpStatus.BAD_REQUEST);
    }

    const salon = await this._reviewRepository.findSalonById(salonId.toString());
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const review = await this._reviewRepository.createReview({
      userId: new mongoose.Types.ObjectId(userId),
      salonId,
      stylistId,
      appointmentId,
      salonRating,
      salonComment,
      stylistRating,
      stylistComment,
    });

    await this._appointmentService.updatedAppointmentReview(appointmentId.toString());

    const salonReviews = await this._reviewRepository.findSalonReviews(salonId.toString());
    const salonAvgRating = salonReviews.length
      ? salonReviews.reduce((sum, r) => sum + r.salonRating, 0) / salonReviews.length
      : 0;
    await this._reviewRepository.updateSalonRating(salonId.toString(), salonAvgRating, salonReviews.length);

    if (stylistId) {
      const stylistReviews = await this._reviewRepository.findStylistReviews(stylistId.toString());
      const stylistAvgRating = stylistReviews.length
        ? stylistReviews.reduce((sum, r) => sum + (r.stylistRating || 0), 0) / stylistReviews.length
        : 0;
      await this._reviewRepository.updateStylistRating(stylistId.toString(), stylistAvgRating, stylistReviews.length);
    }

    return review;
  }

  async getSalonReviews(salonId: string): Promise<IReviewDocument[]> {
    if (!salonId || !mongoose.Types.ObjectId.isValid(salonId)) {
      throw new CustomError(Messages.INVALID_ID, HttpStatus.BAD_REQUEST);
    }
    return await this._reviewRepository.findSalonReviews(salonId);
  }

  async getStylistReviews(stylistId: string): Promise<IReviewDocument[]> {
    if (!stylistId || !mongoose.Types.ObjectId.isValid(stylistId)) {
      throw new CustomError(Messages.INVALID_ID, HttpStatus.BAD_REQUEST);
    }
    return await this._reviewRepository.findStylistReviews(stylistId);
  }
}

export default ReviewService;