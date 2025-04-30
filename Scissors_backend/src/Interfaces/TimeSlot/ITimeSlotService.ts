import { ITimeSlot, ITimeSlotDocument } from "./ITimeSlot";

export interface ITimeSlotService {
    generateSlots(salonId: string, serviceIds: string[], date: Date, stylistId: string): Promise<ITimeSlotDocument[]>;
    updateSlotStatus(slotId: string, slotStatus: ITimeSlot['status']): Promise<ITimeSlotDocument | null>;
  }