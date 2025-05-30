import { BaseRepository } from "./BaseRepository";
import { IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { IReview, IReviewDocument } from "../Interfaces/Reviews/IReview";
import { IReviewRepository } from "../Interfaces/Reviews/IReviewRepository";
import Appointment from "../models/Appointment";
import Review from "../models/Review";
import  { ISalonDocument } from "../models/Salon";
import SalonRepository from "./SalonRepository";
import StylistRepository from "./StylistRepository";

// Minimal AppointmentRepository until a proper one is provided
class AppointmentRepository extends BaseRepository<IAppointmentDocument> {
  constructor() {
    super(Appointment);
  }
}

const appointmentRepo = new AppointmentRepository();
const salonRepo = new SalonRepository();
const stylistRepo = new StylistRepository();

class ReviewRepository extends BaseRepository<IReviewDocument> implements IReviewRepository {
  constructor() {
    super(Review);
  }

  async createReview(data: Partial<IReview>): Promise<IReviewDocument> {
    return await this.create(data);
  }

  async findReviewByAppointmentId(appointmentId: string): Promise<IReviewDocument | null> {
    return await this.findOne({ appointmentId });
  }

  async findAppointmentById(appointmentId: string): Promise<IAppointmentDocument | null> {
    return await appointmentRepo.findById(appointmentId);
  }

  async findSalonById(salonId: string): Promise<ISalonDocument | null> {
    return await salonRepo.findById(salonId);
  }

  async findSalonReviews(salonId: string): Promise<IReviewDocument[]> {
    return await this.model
      .find({ salonId })
      .populate([
        { path: "userId", select: "firstname lastname" },
        { path: "stylistId", select: "name" },
      ])
      .lean()
      .exec();
  }

  async findStylistReviews(stylistId: string): Promise<IReviewDocument[]> {
    return await this.model
      .find({ stylistId })
      .populate([
        { path: "userId", select: "firstname lastname" },
        { path: "salonId", select: "salonName" },
      ])
      .lean()
      .exec();
  }

  async updateSalonRating(salonId: string, rating: number, reviewCount: number): Promise<void> {
    await salonRepo.updateById(salonId, { rating, reviewCount }, { new: true });
  }

  async updateStylistRating(stylistId: string, rating: number, reviewCount: number): Promise<void> {
    await stylistRepo.updateById(stylistId, { rating, reviewCount }, { new: true });
  }
}

export default ReviewRepository;