import mongoose, {Schema} from "mongoose";
import { IOffer, IOfferDocument } from "../Interfaces/Offers/IOffer";

const OfferSchema = new Schema({
    salonId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Salon',
        required:true
    },
    title:{
        type:String,
        required:true,
        minlength:5,
        maxlength:50,
    },
    description:{
        type:String,
        required:true,
        minlength:10,
        maxlength:200
    },
    discount:{
        type:Number,
        required:true,
        min:1,
        max:100
    },
    serviceIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Service'
    }],
    expirtyDate:{
        type:Date,
        required:true
    },
    isActive:{
        type:Boolean,
        required:true
    }
},{timestamps:true})

export default mongoose.model<IOfferDocument>("Offer",OfferSchema)