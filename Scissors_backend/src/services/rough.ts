import moment from "moment-timezone";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import mongoose from "mongoose";
import { ITimeSlot } from "../Interfaces/TimeSlot/ITimeSlot";
import CustomError from "../Utils/cutsomError";

class SlotService{
    private salonRepository:ISalonRepository
    private timeSlotRepository:ITimeSlotRepository
    constructor(salonRepository:ISalonRepository,timeslotRepository:ITimeSlotRepository){
        this.salonRepository = salonRepository;
        this.timeSlotRepository = timeslotRepository
    }

    async generateSlots(salonId: string, serviceIds: string[], date: Date, stylistId: string) {
        const existingSlots = await this.timeSlotRepository.findavailableSlots(
            salonId,
            serviceIds,
            date,
            stylistId
        );
    
        // 1. Get salon and service data
        const salon = await this.salonRepository.getSalonById(salonId);
        if (!salon) {
            throw new CustomError("Salon not found. Please verify the salon ID and try again.", 404);
        }
    
        // Filter services based on the provided service IDs
        const services = salon.services.filter(service =>
            serviceIds.includes(service._id.toString())
        );
      
        if (services.length === 0) {
            throw new CustomError("No valid services found", 400);
        }
    
        // 2. Calculate total duration for all selected services
        const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
       
    
        // 3. Setup time parameters
        const timeZone = salon.timeZone;
        const localDate = moment.tz(date, timeZone).startOf('day');
        const dayOfWeek = localDate.format('dddd');
    
        // 4. Calculate salon availability
        const [openH, openM] = salon.openingTime.split(':').map(Number);
        const [closeH, closeM] = salon.closingTime.split(':').map(Number);
        const salonStart = localDate.clone().set({ hour: openH, minute: openM });
        const salonClose = localDate.clone().set({ hour: closeH, minute: closeM });
    
        console.log("Salon Open:", salonStart.format());
        console.log("Salon Close:", salonClose.format());
    
        // 5. Generate slots for each stylist
        const newSlots = [];
        for (const service of services) {
            for (const stylist of service.stylists) {
                if (stylistId && stylist._id.toString() !== stylistId) continue;
    
                const workingHours = stylist.workingHours.find(wh => wh.day === dayOfWeek);
                if (!workingHours) continue;
    
                console.log("Stylist:", stylist._id.toString(), "Working Hours:", stylist.workingHours);
                console.log("Day of Week:", dayOfWeek);
                console.log("Matched Working Hours:", workingHours);
    
                // Calculate stylist availability window
                const [startH, startM] = workingHours.startTime.split(':').map(Number);
                const [endH, endM] = workingHours.endTime.split(':').map(Number);
                const stylistStart = localDate.clone().set({ hour: startH, minute: startM });
                const stylistEnd = localDate.clone().set({ hour: endH, minute: endM });
    
                // Find overlapping availability
                const slotStart = moment.max(salonStart, stylistStart);
                const slotEnd = moment.min(salonClose, stylistEnd);
                if (slotStart >= slotEnd) continue;
    
                console.log("Slot Start:", slotStart.format());
                console.log("Slot End:", slotEnd.format());
    
                let current = slotStart.clone();
                while (current < slotEnd) {
                    const endTime = current.clone().add(totalDuration, 'minutes');
                    if (endTime > slotEnd) break;
    
                    // Check if slot already exists
                    const exists = existingSlots.some(slot =>
                        slot.startTime.getTime() === current.toDate().getTime() &&
                        slot.endTime.getTime() === endTime.toDate().getTime()
                    );
    
                    console.log("Checking Slot:", {
                        salon: salonId,
                        stylist: stylist._id,
                        service: serviceIds,
                        startTime: current.toDate(),
                        endTime: endTime.toDate(),
                        exists,
                    });
    
                    if (!exists) {
                        newSlots.push({
                            startTime: current.toDate(),
                            endTime: endTime.toDate(),
                            stylist: new mongoose.Types.ObjectId(stylist._id.toString()),
                            service: serviceIds.map(id => new mongoose.Types.ObjectId(id)),
                            salon: new mongoose.Types.ObjectId(salonId),
                            status: 'available' as ITimeSlot["status"]
                        });
                    }
    
                    console.log("Added Slot:", {
                        startTime: current.toDate(),
                        endTime: endTime.toDate(),
                    });
    
                    current = endTime;
                }
            }
        }
    
        console.log("Generated Slots:", newSlots);
        if (newSlots.length > 0) {
            try {
                await this.timeSlotRepository.bulkCreate(newSlots);
            } catch (error) {
                throw new CustomError("Failed to save generated slots. Please try again later.", 500);
            }
        }
    
        return await this.timeSlotRepository.findavailableSlots(salonId, serviceIds, date, stylistId);
    }
   
}

export default SlotService