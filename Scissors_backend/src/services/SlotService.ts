import moment from "moment-timezone";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import mongoose from "mongoose";
import { ITimeSlot, ITimeSlotDocument } from "../Interfaces/TimeSlot/ITimeSlot";
import CustomError from "../Utils/cutsomError";
import { ISalonDocument } from "../models/Salon";
import { ISalonService } from "../Interfaces/Salon/ISalon";
import { ITimeSlotService } from "../Interfaces/TimeSlot/ITimeSlotService";

class SlotService implements ITimeSlotService {
    private salonRepository: ISalonRepository;
    private timeSlotRepository: ITimeSlotRepository;

    constructor(salonRepository: ISalonRepository, timeslotRepository: ITimeSlotRepository) {
        this.salonRepository = salonRepository;
        this.timeSlotRepository = timeslotRepository;
    }

    async generateSlots(salonId: string, serviceIds: string[], date: Date, stylistId: string) {

        try {
            const existingSlots = await this.timeSlotRepository.findAllSlots(
                salonId,
                serviceIds,
                new Date(date),
                stylistId
            )
    
            const salon = await this.salonRepository.getSalonById(salonId);
            if (!salon) {
                throw new CustomError("Salon not found. Please verify the salon ID and try again.", 404);
            }
    
            const services = salon.services.filter(service =>
                serviceIds.includes(service._id.toString())
            );
            if (services.length === 0) {
                throw new CustomError("No valid services found", 400);
            }
            console.log(services,"services before generating slots")
            const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    
            const newSlots = await this.generateHybridSlots(
                salon,
                services,
                new Date(date),
                stylistId,
                totalDuration,
                existingSlots
            );
    
            if (newSlots.length > 0) {
                await this.timeSlotRepository.bulkCreate(newSlots);
            }
    
            return await this.timeSlotRepository.findavailableSlots(salonId, serviceIds, new Date(date), stylistId);
        } catch (error:any) {
            console.error("Error in generateSlots:", error);
            throw new CustomError(error.message || "Failed to generate slots", 500);
        }
        
    }

    // Update the generateHybridSlots method
async generateHybridSlots(
    salon: ISalonDocument,
    services: ISalonService[],
    date: Date,
    stylistId: string,
    totalDuration: number,
    existingSlots: ITimeSlotDocument[]
): Promise<ITimeSlot[]> {
    console.log("entered in the hybridslot generation logic");
    const newSlots: ITimeSlot[] = [];
    const timeZone = salon.timeZone;
    const localDate = moment.tz(date, timeZone).startOf("day");
    const dayOfWeek = localDate.format("dddd");

    const [openH, openM] = salon.openingTime.split(":").map(Number);
    const [closeH, closeM] = salon.closingTime.split(":").map(Number);
    const salonStart = localDate.clone().set({ hour: openH, minute: openM });
    const salonClose = localDate.clone().set({ hour: closeH, minute: closeM });

    const bufferTime = 10;

    // Validate services first
    if (!services || services.length === 0) {
        console.error("No valid services provided");
        return newSlots;
    }

    for (const service of services) {
        console.log("Processing service:", service._id);
        
        for (const stylist of service.stylists) {
            console.log("Processing stylist:", stylist._id);
            
            // Skip if stylistId is provided and doesn't match
            if (stylistId && stylist._id.toString() !== stylistId) {
                console.log("Skipping stylist - ID mismatch");
                continue;
            }

            // Verify stylist provides this service
            const providesService = stylist.services.some(s => 
                s.toString() === service.service._id.toString()
            );
            
            if (!providesService) {
                console.log("Skipping stylist - doesn't provide this service");
                continue;
            }

            const workingHours = stylist.workingHours.find(wh => wh.day === dayOfWeek);
            if (!workingHours) {
                console.log("Skipping stylist - no working hours for this day");
                continue;
            }

            const [startH, startM] = workingHours.startTime.split(":").map(Number);
            const [endH, endM] = workingHours.endTime.split(":").map(Number);
            const stylistStart = localDate.clone().set({ hour: startH, minute: startM });
            const stylistEnd = localDate.clone().set({ hour: endH, minute: endM });

            const slotStart = moment.max(salonStart, stylistStart);
            const slotEnd = moment.min(salonClose, stylistEnd);

            if (slotStart.isSameOrAfter(slotEnd)) {
                console.log("Skipping - no valid time window");
                continue;
            }

            let current = slotStart.clone();
            while (current.isBefore(slotEnd)) {
                const endTime = current.clone().add(totalDuration + bufferTime, "minutes");

                if (endTime.isAfter(slotEnd)) break;

                                // In generateHybridSlots - update the conflict check:
                    const slotConflict = existingSlots.some(slot => {
                        const slotStart = moment(slot.startTime);
                        const slotEnd = moment(slot.endTime);
                        return (
                            (current.isSameOrAfter(slotStart) && current.isBefore(slotEnd)) ||
                            (endTime.isAfter(slotStart) && endTime.isSameOrBefore(slotEnd)) ||
                            (current.isBefore(slotStart) && endTime.isAfter(slotEnd))
                        );
                    });

                if (!slotConflict) {
                    newSlots.push({
                        startTime: current.toDate(),
                        endTime: endTime.toDate(),
                        stylist: new mongoose.Types.ObjectId(stylist._id.toString()),
                        service: [new mongoose.Types.ObjectId(service._id.toString())],
                        salon: new mongoose.Types.ObjectId(salon._id.toString()),
                        status: "available"
                    });
                }
        
                current = current.clone().add(totalDuration + bufferTime, "minutes");
            }
        }
    }

    return newSlots;
}

    async updateSlotStatus(slotId:string,slotStatus:ITimeSlot["status"]):Promise<ITimeSlotDocument | null>{
        try {
            const updatedSlot  = await this.timeSlotRepository.updateSlotStatus(
                slotId,
               slotStatus,
                {new:true}
            )
            if(!updatedSlot){
                throw new CustomError("Slot not found",500)
            }
            return updatedSlot
        } catch (error:any) {
            console.log("Error in the UpdateSlot Status service",error)
            throw new CustomError(error.message || "Internal Server Issues",500)
        }
    }
}

export default SlotService;
