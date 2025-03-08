import mongoose, {Document} from "mongoose";

export interface IAppointment {
    user:mongoose.Types.ObjectId,
    salon:mongoose.Types.ObjectId,
    stylist:mongoose.Types.ObjectId,
    service:mongoose.Types.ObjectId,
    slot:mongoose.Types.ObjectId,
    status:'pending' | 'confirmed' |  'completed'
}

export interface IAppointmentDocument extends Document{
    user:mongoose.Types.ObjectId,
    salon:mongoose.Types.ObjectId,
    stylist:mongoose.Types.ObjectId,
    service:mongoose.Types.ObjectId,
    slot:mongoose.Types.ObjectId,
    status:'pending' | 'confirmed' |  'completed'
}