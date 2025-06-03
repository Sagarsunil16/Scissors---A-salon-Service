import mongoose from "mongoose";
import { ITimeSlot, ITimeSlotDocument, ISlotGroup } from "./ITimeSlot";

export interface ITimeSlotService {
  findAllAvailableSlots(salonId:string,data:Date,stylistId:string):Promise<ITimeSlotDocument[]>
  generateSlots(salonId: string, date: Date, stylistId: string): Promise<ITimeSlotDocument[]>;
  findConsecutiveSlots(
    salonId: string,
    serviceIds: string[],
    date: Date,
    stylistId: string,
    requiredDuration: number
  ): Promise<ISlotGroup[]>;
  updateSlotStatus(slotId: string, slotStatus: ITimeSlot["status"]): Promise<ITimeSlotDocument | null>;
  findAvailableSlotsById(slotId: string): Promise<ITimeSlotDocument | null>;
  findAvailableSlotsByIds(slotIds: string[]): Promise<ITimeSlotDocument[]>;
  reserveSlotGroup(slotIds: string[], reservedUntil: Date, bookingId:string, userId:string, session?:mongoose.ClientSession): Promise<void>;
  releaseSlots(slotIds: string[], session?: mongoose.ClientSession): Promise<void>
  updateSlotsStatus(slotIds: string[], status: ITimeSlot["status"]): Promise<void>;
  findAvailableSlots(salonId: string, serviceIds: string[], date: Date, stylistId: string): Promise<ISlotGroup[]>;
  getSlotsByIds(slotIds: string[]):Promise<ITimeSlotDocument[]>
}