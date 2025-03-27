import mongoose, {Document} from "mongoose";

export enum AppointmentStatus {
    Pending = "pending",
    Confirmed = "confirmed",
    Completed = "completed",
}

export enum PaymentStatus {
    Pending = "pending",
    paid = "paid",
    Failed = "failed"
}

export enum PaymentMethod {
    Cash  = 'cash',
    Online = 'online'
}


export interface IAppointment extends Document {
    user:mongoose.Types.ObjectId,
    salon:mongoose.Types.ObjectId,
    stylist:mongoose.Types.ObjectId,
    services:mongoose.Types.ObjectId[],
    slot:mongoose.Types.ObjectId,
    status:AppointmentStatus
    totalPrice: number; // Total price of the appointment
    paymentStatus: PaymentStatus // Payment status
    paymentMethod: "cash" | "online"; // Payment method
    serviceOption: "home" | "store"; // Service option (home or store)
    address?:string

}

export interface IAppointmentDocument extends IAppointment, Document{
   
}