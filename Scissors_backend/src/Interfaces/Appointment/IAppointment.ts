import mongoose, {Document} from "mongoose";

export interface IAppointment {
    user:mongoose.Types.ObjectId,
    salon:mongoose.Types.ObjectId,
    stylist:mongoose.Types.ObjectId,
    service:mongoose.Types.ObjectId,
    slot:mongoose.Types.ObjectId,
    status:'pending' | 'confirmed' |  'completed',
    totalPrice: number; // Total price of the appointment
    paymentStatus: "pending" | "paid" | "failed"; // Payment status
    paymentMethod: "cash" | "online"; // Payment method
    serviceOption: "home" | "store"; // Service option (home or store)
    createdAt: Date; // Timestamp when the appointment was created
    updatedAt: Date; // Timestamp when the appointment was last updated
}

export interface IAppointmentDocument extends IAppointment, Document{
   
}