import mongoose from "mongoose";
import { Address } from "../IUser";
export interface ISalon {
  salonName: string;
  email: string;
  phone: number;
  password: string;
  address: Address;
  openingTime: string;
  closingTime: string;
  verified: boolean;
  is_Active: boolean;
  category:mongoose.Types.ObjectId | string;
  images: {
    [x: string]: any;
    id: string;
    url: string;
  }[];
  otp?: string | null;
  otpExpiry?: Date | null;
  services:[
    {
    service:mongoose.Types.ObjectId,
    name:String,
    description:String,
    price:string
  }
  ]
}


export interface SalonQueryParams {
  search?: string;
  location?: string;
  maxPrice?: number;
  rating?: string[];
  offers?: string;
}