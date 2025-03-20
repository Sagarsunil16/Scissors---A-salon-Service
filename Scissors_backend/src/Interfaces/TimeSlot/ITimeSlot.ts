import mongoose , {Document} from "mongoose";

export interface ITimeSlot{
    salon:mongoose.Types.ObjectId,
    stylist:mongoose.Types.ObjectId,
    startTime:Date,
    endTime:Date,
    service:mongoose.Types.ObjectId[],
    status:'available' | 'booked' | 'cancelled'
}

export interface ITimeSlotDocument extends Document{
    salon:mongoose.Types.ObjectId,
    stylist:mongoose.Types.ObjectId,
    startTime:Date,
    endTime:Date,
    service:mongoose.Types.ObjectId[],
    status:'available' | 'booked' | 'cancelled'
}
