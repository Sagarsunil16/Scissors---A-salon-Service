import { IReview, IReviewDocument } from "../Interfaces/Reviews/IReview";
import { IReviewRepository } from "../Interfaces/Reviews/IReviewRepository";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import CustomError from "../Utils/cutsomError";

class ReviewService implements IReviewService{
    private _repository:IReviewRepository
    constructor(repository:IReviewRepository){
        this._repository = repository
    }
    async createReview(reviewData:IReview):Promise<IReviewDocument>{
        const appointment = await this._repository.findAppointmentById(reviewData.appointmentId.toString());
        if(!appointment){
            throw new CustomError("Appointment not found",404)
        }
        if(appointment.status!=='completed'){
            throw new CustomError('Reviews can only be submitted for completed appointments',400)
        }
        if(appointment.user.toString() !==  reviewData.userId.toString()){
            throw new CustomError("Unauthorized: User does not own this appointment",403)
        }

        const existingReview = await this._repository.findReviewByAppointmentId(reviewData.appointmentId.toString())
        if (existingReview) {
            throw new CustomError("Review already submitted for this appointment", 400);
          }

        const salon = await this._repository.findSalonById(reviewData.salonId.toString())
        if(!salon){
            throw new CustomError("Salon not found",404)
        }

        //create review 
        const review = this._repository.createReview(reviewData)

        //update salon ratings
        const salonReviews = await this._repository.findSalonReviews(reviewData.salonId.toString())
        const salonAvgRating = salonReviews?.length? salonReviews.reduce((sum,r)=>sum + r.salonRating,0) /salonReviews.length : 0
        await this._repository.updateSalonRating(reviewData.salonId.toString(),salonAvgRating,salonReviews.length)

        //update stylist ratings
        const stylistReviews =  await this._repository.findStylistReviews(reviewData.stylistId.toString())
        const stylistAvgRating = stylistReviews?.length? stylistReviews.reduce((sum,r)=>sum+r.salonRating,0) / stylistReviews.length : 0
        await this._repository.updateStylistRating(reviewData.stylistId.toString(),stylistAvgRating,stylistReviews.length)

        return review
    }

    async getSalonReviews(salonId:string):Promise<IReviewDocument[]>{
        return await this._repository.findSalonReviews(salonId)
    }


    async getStylistReviews(stylistId:string):Promise<IReviewDocument[]>{
        return await this._repository.findStylistReviews(stylistId)
    }
}

export default ReviewService