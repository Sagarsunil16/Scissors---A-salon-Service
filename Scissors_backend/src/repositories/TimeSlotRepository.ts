import mongoose, { Document, Query } from "mongoose";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import TimeSlotModel from "../models/TimeSlot";
import { ITimeSlot, ITimeSlotDocument } from "../Interfaces/TimeSlot/ITimeSlot";
import CustomError from "../Utils/cutsomError";
import moment from "moment-timezone";

class TimeSlotRepository implements ITimeSlotRepository {
  async findAllSlots(salonId: string, date: Date, stylistId?: string): Promise<ITimeSlotDocument[]> {
    const timeZone = 'Asia/Kolkata';
    const localDate = moment.tz(date, timeZone).startOf('day');
    const startOfDay = localDate.clone().utc().toDate();
    const endOfDay = localDate.clone().endOf('day').utc().toDate();

   console.log(`Querying all slots for salon ${salonId} on ${localDate.format('YYYY-MM-DD')} from ${moment(startOfDay).format('HH:mm')} to ${moment(endOfDay).format('HH:mm')} UTC`);


    const query: any = {
      salon: new mongoose.Types.ObjectId(salonId),
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: "available",
      $or: [
  { reservedUntil: null },
  { reservedUntil: { $lte: new Date() } }
]
    }
    if (stylistId) {
      query.stylist = new mongoose.Types.ObjectId(stylistId);
    }
    return TimeSlotModel.find(query).exec();
  }

  async findAvailableSlots(salonId: string, date: Date, stylistId?: string): Promise<ITimeSlotDocument[]> {
    const timeZone = 'Asia/Kolkata';
    const localDate = moment.tz(date, timeZone).startOf('day');
    const startOfDay = localDate.clone().utc().toDate();
    const endOfDay = localDate.clone().endOf('day').utc().toDate();

    const query: any = {
      salon: new mongoose.Types.ObjectId(salonId),
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: "available",
    };

    if (stylistId) {
      query.stylist = new mongoose.Types.ObjectId(stylistId);
    }

    return await TimeSlotModel.find(query)
      .sort({ startTime: 1 })
      .exec();
  }

  async bulkCreate(slots: ITimeSlot[]): Promise<ITimeSlotDocument[]> {
    try {
      return await TimeSlotModel.insertMany(slots, { ordered: false });
    } catch (error: any) {
      if (error.code === 11000) {
        console.log('Some slots already exist, continuing with created ones');
        return error.ops || [];
      }
      throw new CustomError("Failed to create slots", 500);
    }
  }

  async updateSlotStatus(slotId: string, status: ITimeSlot["status"], version: number, options: mongoose.QueryOptions = {}): Promise<ITimeSlotDocument | null> {
    return TimeSlotModel.findOneAndUpdate(
      { _id: slotId, version },
      { status, $inc: { version: 1 } },
      { new: true, ...options }
    ).exec();
  }

  async findById(slotId: string): Promise<ITimeSlotDocument | null> {
    return TimeSlotModel.findById(slotId).exec();
  }

  async findByIds(slotIds: string[]): Promise<ITimeSlotDocument[]> {
    return TimeSlotModel.find({ _id: { $in: slotIds } }).exec();
  }

  async updateMany(filter: Record<string, any>, update: Record<string, any>,  options: mongoose.QueryOptions = {}): Promise<mongoose.UpdateWriteOpResult> {
    return await TimeSlotModel.updateMany(filter, update).exec();
  }

  async clearExpiredReservations(): Promise<void> {
    await TimeSlotModel.updateMany(
      { reservedUntil: { $lte: new Date() } },
      { status: "available", reservedUntil: null }
    ).exec();
  }

  find(query: any): mongoose.Query<ITimeSlotDocument[], ITimeSlotDocument> {
    return TimeSlotModel.find(query);
  }
}

export default TimeSlotRepository;