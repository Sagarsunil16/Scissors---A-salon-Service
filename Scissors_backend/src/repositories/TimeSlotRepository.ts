import mongoose from "mongoose";
import { ITimeSlot, ITimeSlotDocument } from "../Interfaces/TimeSlot/ITimeSlot";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import TimeSlot from "../models/TimeSlot";

class TimeSlotRepository implements ITimeSlotRepository {
    async bulkCreate(slots: ITimeSlot[]): Promise<ITimeSlotDocument[]> {
        return await TimeSlot.insertMany(slots);
    }

    async exists(filter: Record<string, any>): Promise<boolean> {
        const count = await TimeSlot.countDocuments(filter);
        return count > 0;
    }

    async findavailableSlots(salonId: string, serviceIds: string[], date: Date, stylistId?: string): Promise<ITimeSlotDocument[]> {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const query: any = {
            salon: new mongoose.Types.ObjectId(salonId),
            service: { $in: serviceIds.map(id => new mongoose.Types.ObjectId(id)) },
            startTime: { $gte: startOfDay },
            endTime: { $lte: endOfDay },
            status: "available",
        };

        if (stylistId) {
            query.stylist = new mongoose.Types.ObjectId(stylistId);
        }

        return await TimeSlot.find(query).populate("stylist").exec();
    }
}

export default TimeSlotRepository;
