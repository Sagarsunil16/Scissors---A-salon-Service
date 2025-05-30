import mongoose from "mongoose";

export interface ITimeSlot {
  startTime: Date;
  endTime: Date;
  stylist: mongoose.Types.ObjectId;
  salon: mongoose.Types.ObjectId;
  status: "available" | "booked" | "cancelled" | "reserved";
  version: number;
  reservedUntil: Date | null;
}

export interface ITimeSlotDocument extends ITimeSlot, Document {
  _id: mongoose.Types.ObjectId;
}

export interface ISlotGroup {
  _id: string; // Comma-separated slot IDs
  startTime: Date;
  endTime: Date;
  stylist: mongoose.Types.ObjectId;
  salon: mongoose.Types.ObjectId;
  status: "available" | "booked" | "cancelled" | "reserved";
  slotIds: string[]; // Array of individual slot IDs
  duration:number;
}