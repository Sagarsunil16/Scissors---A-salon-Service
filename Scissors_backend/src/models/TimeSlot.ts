import mongoose, { Schema, Document } from "mongoose";
import { ITimeSlot, ITimeSlotDocument } from "../Interfaces/TimeSlot/ITimeSlot";

const timeSlotSchema: Schema = new Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stylist",
    required: true,
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "booked", "cancelled","reserved"],
    default: "available",
  },
  version: {
    type: Number,
    default: 0,
  },
  reservedUntil: {
    type: Date,
    default: null,
  },
});

timeSlotSchema.index({ salon: 1, stylist: 1, startTime: 1, status: 1 });

export default mongoose.model<ITimeSlotDocument>("TimeSlot", timeSlotSchema);