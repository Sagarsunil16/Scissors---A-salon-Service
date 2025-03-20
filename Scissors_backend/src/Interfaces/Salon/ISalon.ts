import mongoose from "mongoose";
import { ObjectId } from "mongoose";
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
    _id:mongoose.Schema.Types.ObjectId
    service:{
      _id:mongoose.Types.ObjectId,
    name:string,
    description:string,
    },
    name:string,
    description:string,
    price:number,
    duration:number
    stylists:[
      {_id:mongoose.Schema.Types.ObjectId,
        name:string,
        salon:mongoose.Schema.Types.ObjectId,
        email:string,
        phone:string,
        workingHours:{
          day:string,
          startTime:string,
          endTime:string
        }[],
        services:mongoose.Schema.Types.ObjectId[],
        isAvailable:boolean
      }]
  }
  ],
  timeZone:string
  rating:string
}

export interface ISalonService {
  _id: mongoose.Schema.Types.ObjectId;
  service: {
    _id:mongoose.Types.ObjectId,
  name:string,
  description:string,
  },
  name: string;
  description: string;
  price: number;
  duration: number;
  stylists: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    salon: mongoose.Schema.Types.ObjectId;
    email: string;
    phone: string;
    workingHours: { day: string; startTime: string; endTime: string }[];
    services: mongoose.Schema.Types.ObjectId[]; // If needed, otherwise remove
    isAvailable: boolean;
  }[];
}



export interface SalonQueryParams {
  search?: string;
  location?: string;
  maxPrice?: number;
  rating?: string[];
  offers?: string;
}

 