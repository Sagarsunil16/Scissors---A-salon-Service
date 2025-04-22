import mongoose ,{Document} from "mongoose";

export interface IReview{
    userId:mongoose.Types.ObjectId,
    salonId:mongoose.Types.ObjectId,
    stylistId:mongoose.Types.ObjectId,
    appointmentId:mongoose.Types.ObjectId,
    salonRating:number,
    salonComment:string,
    stylistRating:number,
    stylistComment:string,
}

export interface IReviewDocument extends IReview,Document{

}