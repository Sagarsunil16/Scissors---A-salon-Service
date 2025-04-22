import mongoose ,{Mongoose, Schema} from "mongoose";
import { IStylist, IStylistDocument } from "../Interfaces/Stylist/IStylist";

const stylistSchema:Schema = new Schema({
    name:{
        type:String,
        required:true
    },
    salon:{
        type:mongoose.Types.ObjectId,
        ref:'Salon',
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    workingHours:[{
        day:{
            type:String,
            enum:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
            required:true   
        },
        startTime:String,
        endTime:String
    }],
    services:[{
        type:mongoose.Types.ObjectId,
        ref:"Service",
        required:true
    }],

    isAvailable:{
        type:Boolean
    },

    rating:{
        type:Number,
        default:0
    },
    reviewCount:{
        type:Number,
        default:0
    }

})

export default mongoose.model<IStylistDocument>("Stylist",stylistSchema)