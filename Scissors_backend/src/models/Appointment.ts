import mongoose, { Schema } from "mongoose";
import { IAppointmentDocument } from "../Interfaces/Appointment/IAppointment";
import { AppointmentStatus,PaymentStatus } from "../Interfaces/Appointment/IAppointment";
const appointmentSchema: Schema<IAppointmentDocument> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    stylist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stylist",
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
    ],
   slots: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TimeSlot",
    required: true,
  },
],
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.Pending
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: true,
    },
    stripeSessionId:{
      type:String,
      default:null
    },
    serviceOption: {
      type: String,
      enum: ["home", "store"],
      required: true,
    },
    isReviewed:{
      type:Boolean,
      default:false
    },
    address: {
      type:{
        areaStreet: String,
        city: String,
        state: String,
        pincode: String
      },
      required: function () {
        return this.serviceOption === "home";
      },
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ user: 1, salon: 1, status: 1 });

export default mongoose.model<IAppointmentDocument>("Appointment", appointmentSchema);