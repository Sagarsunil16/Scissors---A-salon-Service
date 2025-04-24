import mongoose, { Document } from "mongoose";

export interface IOffer {
  salonId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  discount: number;
  serviceIds: mongoose.Types.ObjectId[];
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
}


export interface IOfferDocument extends IOffer, Document{}