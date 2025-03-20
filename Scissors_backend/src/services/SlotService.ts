import moment from "moment-timezone";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import mongoose from "mongoose";
import { ITimeSlot, ITimeSlotDocument } from "../Interfaces/TimeSlot/ITimeSlot";
import CustomError from "../Utils/cutsomError";
import { ISalonDocument } from "../models/Salon";
import { ISalonService } from "../Interfaces/Salon/ISalon";

class SlotService {
    private salonRepository: ISalonRepository;
    private timeSlotRepository: ITimeSlotRepository;

    constructor(salonRepository: ISalonRepository, timeslotRepository: ITimeSlotRepository) {
        this.salonRepository = salonRepository;
        this.timeSlotRepository = timeslotRepository;
    }

    async generateSlots(salonId: string, serviceIds: string[], date: Date, stylistId: string) {

        const existingSlots = await this.timeSlotRepository.findavailableSlots(
            salonId,
            serviceIds,
            new Date(date),
            stylistId
        );

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
            try {
                await this.timeSlotRepository.bulkCreate(newSlots);
                console.log("New slots saved successfully.");
            } catch (error) {
                console.error("Error saving slots:", error);
                throw new CustomError("Failed to save generated slots. Please try again later.", 500);
            }
        }

        return await this.timeSlotRepository.findavailableSlots(salonId, serviceIds, new Date(date), stylistId);
    }

    async generateHybridSlots(
        salon: ISalonDocument,
        services: ISalonService[],
        date: Date,
        stylistId: string,
        totalDuration: number,
        existingSlots: ITimeSlotDocument[]
    ): Promise<ITimeSlot[]> {
        console.log("entered in the hybridslot generation logiv")
        console.log(salon,services,stylistId,totalDuration,existingSlots,"params")
        const newSlots: ITimeSlot[] = [];
        const timeZone = salon.timeZone;
        const localDate = moment.tz(date, timeZone).startOf("day");
        const dayOfWeek = localDate.format("dddd");

        const [openH, openM] = salon.openingTime.split(":").map(Number);
        const [closeH, closeM] = salon.closingTime.split(":").map(Number);
        const salonStart = localDate.clone().set({ hour: openH, minute: openM });
        const salonClose = localDate.clone().set({ hour: closeH, minute: closeM });

        const bufferTime = 10; 

        for (const service of services) {
            console.log("service to check",service)
            for (const stylist of service.stylists) {
                console.log(stylist,"stylists")
                if (stylistId && stylist._id.toString() !== stylistId) continue;
                console.log("services in string",stylist.services.toString())
                console.log("details",service,"service detals")
                if (!stylist.services.map(id => id.toString()).includes(service.service._id.toString())) continue;
                console.log("No probelem in the stylist services")
                const workingHours = stylist.workingHours.find(wh => wh.day === dayOfWeek);
                console.log(workingHours,"workinghours")
                if (!workingHours) continue;

                const [startH, startM] = workingHours.startTime.split(":").map(Number);
                const [endH, endM] = workingHours.endTime.split(":").map(Number);
                const stylistStart = localDate.clone().set({ hour: startH, minute: startM });
                const stylistEnd = localDate.clone().set({ hour: endH, minute: endM });

                console.log("Salon Opening Time:", salonStart.format("YYYY-MM-DD HH:mm"));
console.log("Salon Closing Time:", salonClose.format("YYYY-MM-DD HH:mm"));


                const slotStart = moment.max(salonStart, stylistStart);
                const slotEnd = moment.min(salonClose, stylistEnd);

                console.log("Stylist Working Hours:", stylistStart.format("YYYY-MM-DD HH:mm"), "to", stylistEnd.format("YYYY-MM-DD HH:mm"));
console.log("Effective Slot Window:", slotStart.format("YYYY-MM-DD HH:mm"), "to", slotEnd.format("YYYY-MM-DD HH:mm"));

                if (slotStart.isSameOrAfter(slotEnd)) continue;

                let current = slotStart.clone();
                while (current.isBefore(slotEnd)) {
                    const endTime = current.clone().add(totalDuration + bufferTime, "minutes");

                    if (endTime.isAfter(slotEnd)) break;

                    const exists = existingSlots.some(slot =>
                        moment(slot.startTime).isBefore(endTime) &&
                        moment(slot.endTime).isAfter(current)
                    );
                    if (!exists) {
                        newSlots.push({
                            startTime: current.toDate(),
                            endTime: endTime.toDate(),
                            stylist: new mongoose.Types.ObjectId(stylist._id.toString()),
                            service: services.map(service =>
                                new mongoose.Types.ObjectId(service._id.toString())
                            ),
                            salon: new mongoose.Types.ObjectId(salon._id.toString()),
                            status: "available" as ITimeSlot["status"],
                        });
                    }

                    current = current.clone().add(totalDuration + bufferTime, "minutes");
                }
            }
        }

        return newSlots;
    }
}

export default SlotService;
