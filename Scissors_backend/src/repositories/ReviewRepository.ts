import { IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { IReview, IReviewDocument } from "../Interfaces/Reviews/IReview";
import { IReviewRepository } from "../Interfaces/Reviews/IReviewRepository";
import Appointment from "../models/Appointment";
import Review from "../models/Review";
import Salon, { ISalonDocument } from "../models/Salon";
import Stylist from "../models/Stylist";
import { BaseRepository } from "./BaseRepository";

class ReviewRepository extends BaseRepository<IReviewDocument> implements IReviewRepository{
    constructor(){
        super(Review)
    }
    async findReviewByAppointmentId(appointmentId: string): Promise<IReviewDocument | null> {
        return await Review.findOne({ appointmentId })
      }
    async findAppointmentById(appointmentId:string):Promise<IAppointmentDocument | null>{
        return await Appointment.findById(appointmentId).lean()
    }
    async findSalonById(salonId:string):Promise<ISalonDocument | null>{
        return await Salon.findById(salonId).lean()
    }
    async findSalonReviews(salonId:string):Promise<IReviewDocument[]>{
        return await Review.find({salonId})
        .populate('userId', 'firstname lastname')
        .populate('stylistId','name')
        .lean()
    }

    async findStylistReviews(stylistId: string): Promise<IReviewDocument[]> {
        return await Review.find({ stylistId })
          .populate("userId", "firstname lastname")
          .populate("salonId", "salonName")
          .lean();
      }

    async updateSalonRating(salonId:string,rating:number,reviewCount:number):Promise<void>{
        await Salon.findByIdAndUpdate(salonId,{rating,reviewCount})
    }

    async updateStylistRating(stylistId:string,rating:number,reviewCount:number):Promise<void>{
        await Stylist.findByIdAndUpdate(stylistId,{rating,reviewCount})
    }
}

export default ReviewRepository