import mongoose, {Document} from "mongoose";

export enum AppointmentStatus {
    Pending = "pending",
    Confirmed = "confirmed",
    Completed = "completed",
    Cancelled = 'cancelled'
}

export enum PaymentStatus {
    Pending = "pending",
    Paid = "paid",
    Failed = "failed"
}

export enum PaymentMethod {
    Cash  = 'cash',
    Online = 'online',
    Wallet = "wallet"
}


export interface IAppointment {
    user:mongoose.Types.ObjectId,
    salon:mongoose.Types.ObjectId,
    stylist:mongoose.Types.ObjectId,
    services:mongoose.Types.ObjectId[],
    slots:mongoose.Types.ObjectId[],
    status:AppointmentStatus
    stripeSessionId:string
    totalPrice: number; // Total price of the appointment
    paymentStatus: PaymentStatus // Payment status
    paymentMethod: "cash" | "online" | "wallet"; // Payment method
    serviceOption: "home" | "store"; // Service option (home or store)
    address?:string,
    createdAt?: Date;
    updatedAt?: Date;
    isReviewed:boolean
    refundToWallet:boolean;
    walletTransaction?:mongoose.Types.ObjectId
    bookingId:string
}


export interface IAppointmentDocument extends IAppointment, Document{
   
}

export interface PopulatedAppointment {
  _id: mongoose.Types.ObjectId;
  user: { firstname: string; lastname: string };
  salon: mongoose.Types.ObjectId;
  services: mongoose.Types.ObjectId[];
  totalPrice: number;
  paymentStatus: string;
  status: "Accepted" | "Pending" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}