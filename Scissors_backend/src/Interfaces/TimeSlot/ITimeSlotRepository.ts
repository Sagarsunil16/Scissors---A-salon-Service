import mongoose, { Document, Query, QueryOptions } from "mongoose";
import { ITimeSlot, ITimeSlotDocument } from "./ITimeSlot";

export interface ITimeSlotRepository {
  findAllSlots(salonId: string, date: Date, stylistId?: string): Promise<ITimeSlotDocument[]>;
  findAvailableSlots(salonId: string, date:Date, stylistId?: string): Promise<ITimeSlotDocument[]>;
  bulkCreate(slots: ITimeSlot[]): Promise<ITimeSlotDocument[]>;
  updateSlotStatus(slotId: string, status: ITimeSlot["status"], version: number, options?: mongoose.QueryOptions): Promise<ITimeSlotDocument | null>;
  findById(slotId: string): Promise<ITimeSlotDocument | null>;
  findByIds(slotIds: string[], session?:mongoose.ClientSession): Promise<ITimeSlotDocument[]>;
  updateMany(filter: Record<string, any>, update: Record<string, any>,options: QueryOptions): Promise<mongoose.UpdateWriteOpResult>;
  clearExpiredReservations(): Promise<void>;
  find(query: any): Query<ITimeSlotDocument[], ITimeSlotDocument>;
}