import mongoose from "mongoose";
import { ITimeSlot, ITimeSlotDocument } from "../Interfaces/TimeSlot/ITimeSlot";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import TimeSlot from "../models/TimeSlot";
import { BaseRepository } from "./BaseRepository";

class TimeSlotRepository extends BaseRepository<ITimeSlotDocument> implements ITimeSlotRepository {
   constructor(){
    super(TimeSlot)
   }
    async bulkCreate(slots: ITimeSlot[]): Promise<ITimeSlotDocument[]> {
        try {
            // Additional validation before insertion
            const validSlots = slots.filter(slot => 
                slot.startTime && 
                slot.endTime && 
                slot.stylist && 
                slot.service && 
                slot.service.length > 0 && 
                slot.salon
            );
    
            if (validSlots.length !== slots.length) {
                console.error(`Filtered out ${slots.length - validSlots.length} invalid slots`);
            }
    
            return await TimeSlot.insertMany(validSlots);
        } catch (error) {
            console.error("Error in bulkCreate:", error);
            throw error;
        }
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

    async updateSlotStatus(slotId: string, status: ITimeSlot["status"] , options?: mongoose.QueryOptions): Promise<ITimeSlotDocument | null> {
        return await this.updateById(slotId,{status},options)
    }

    async findAllSlots(salonId: string, serviceIds: string[], date: Date, stylistId?: string): Promise<ITimeSlotDocument[]> {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
    
        const query: any = {
            salon: new mongoose.Types.ObjectId(salonId),
            service: { $in: serviceIds.map(id => new mongoose.Types.ObjectId(id)) },
            startTime: { $gte: startOfDay },
            endTime: { $lte: endOfDay }
        };
    
        if (stylistId) {
            query.stylist = new mongoose.Types.ObjectId(stylistId);
        }
    
        return await TimeSlot.find(query).exec();
    }

}

export default TimeSlotRepository;
