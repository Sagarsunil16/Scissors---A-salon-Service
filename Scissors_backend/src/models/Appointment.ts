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
    },
    totalPrice: {
        type: Number,
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      paymentMethod: {
        type: String,
        enum: ["cash", "online"],
        required: true,
      },
      serviceOption: {
        type: String,
        enum: ["home", "store"],
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
},{timestamps:true})

appointmentSchema.index({user:1,salon:1,status:1})

export default mongoose.model<IAppointmentDocument>("Appointment",appointmentSchema)