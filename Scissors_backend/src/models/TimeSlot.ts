import { ITimeSlotDocument } from "../Interfaces/TimeSlot/ITimeSlot";
import mongoose , {Schema} from "mongoose";


const timeSlotSchema:Schema = new Schema({
    salon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Salon',
        required:true
    },
    stylist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Stylist',
        required:true
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },
    service:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Service",
        required:true
    },
    status:{
        type:String,
        enum:['available','booked','cancelled'],
        default:'available'
    }
})

timeSlotSchema.index({salon:1,stylist:1,startTime:1}),
{unique:true, partialFilterExpression: { status: 'available' }}

export default mongoose.model<ITimeSlotDocument>("TimeSlot",timeSlotSchema)