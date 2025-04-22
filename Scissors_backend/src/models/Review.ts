
import mongoose , {Schema,Document} from "mongoose";
import { IReview, IReviewDocument } from "../Interfaces/Reviews/IReview";

const ReviewSchema:Schema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    salonId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Salon",
        required:true
    },
    stylistId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Stylist",
        required:true
    },
    appointmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Appointment",
        required:true
    },
    salonRating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    salonComment:{
        type:String,
        required:true
    },
    stylistRating:{
        type:Number,
        required:true,
        min:1,max:5
    },
    stylistComment:{
        type:String,
        required:true
    }
},{timestamps:true})

export default mongoose.model<IReviewDocument>("Review",ReviewSchema)