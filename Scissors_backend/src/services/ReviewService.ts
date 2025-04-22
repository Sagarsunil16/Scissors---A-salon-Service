import { IReview, IReviewDocument } from "../Interfaces/Reviews/IReview";
import { IReviewRepository } from "../Interfaces/Reviews/IReviewRepository";
import CustomError from "../Utils/cutsomError";

class ReviewService{
    private repository:IReviewRepository
    constructor(repository:IReviewRepository){
        this.repository = repository
    }
    async createReview(reviewData:IReview):Promise<IReviewDocument>{
        const appointment = await this.repository.findAppointmentById(reviewData.appointmentId.toString());
        if(!appointment){
            throw new CustomError("Appointment not found",404)
        }
        if(appointment.status!=='completed'){
            throw new CustomError('Reviews can only be submitted for completed appointments',400)
        }
        if(appointment.user.toString() !==  reviewData.userId.toString()){
            throw new CustomError("Unauthorized: User does not own this appointment",403)
        }

        const existingReview = await this.repository.findReviewByAppointmentId(reviewData.appointmentId.toString())
        if (existingReview) {
            throw new CustomError("Review already submitted for this appointment", 400);
          }

        const salon = await this.repository.findSalonById(reviewData.salonId.toString())
        if(!salon){
            throw new CustomError("Salon not found",404)
        }

        //create review 
        const review = this.repository.create(reviewData)

        //update salon ratings
        const salonReviews = await this.repository.findSalonReviews(reviewData.salonId.toString())
        const salonAvgRating = salonReviews?.length? salonReviews.reduce((sum,r)=>sum + r.salonRating,0) /salonReviews.length : 0
        await this.repository.updateSalonRating(reviewData.salonId.toString(),salonAvgRating,salonReviews.length)

        //update stylist ratings
        const stylistReviews =  await this.repository.findStylistReviews(reviewData.stylistId.toString())
        const stylistAvgRating = stylistReviews?.length? stylistReviews.reduce((sum,r)=>sum+r.salonRating,0) / stylistReviews.length : 0
        await this.repository.updateStylistRating(reviewData.stylistId.toString(),stylistAvgRating,stylistReviews.length)

        return review
    }

    async getSalonReviews(salonId:string):Promise<IReviewDocument[]>{
        return await this.repository.findSalonReviews(salonId)
    }


    async getStylistReviews(stylistId:string):Promise<IReviewDocument[]>{
        return await this.repository.findStylistReviews(stylistId)
    }
}

export default ReviewService