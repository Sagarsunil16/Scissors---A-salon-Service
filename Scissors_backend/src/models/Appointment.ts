import mongoose,{Schema} from "mongoose";
import { IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";


const appointmentSchema:Schema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    salon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Salon",
        required:true
    },
    stylist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Stylist",
        required:true
    },
    service:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Service",
        required:true
    },
    slot:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"TimeSlot",
        required:true
    },
    status:{
        type:String,
        enum:["pending","confirmed","completed","cancelled"],
        default:"pending"
    }
},{timestamps:true})

appointmentSchema.index({user:1,salon:1,status:1})

export default mongoose.model<IAppointmentDocument>("Appointment",appointmentSchema)