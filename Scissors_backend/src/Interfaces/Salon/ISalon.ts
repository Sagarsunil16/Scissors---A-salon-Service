import mongoose from "mongoose";

export interface Address{
  areaStreet: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  location?:{
    type:'Point';
    coordinates:[number,number]
  }
}

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
        isAvailable:boolean,
        rating:number,
        reviewCount:number
      }]
  }
  ],
  timeZone:string
  rating:Number,
  reviewCount:Number,
  refreshToken:string | null,
  refreshTokenExpiresAt:Date | null,
  role:string
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
    rating:number;
    reviewCount:number
  }[];
}



export interface SalonQueryParams {
  search?: string;
  location?: string;
  maxPrice?: number;
  rating?: string[];
  offers?: string;
}

 

export interface GeolocationResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };

}

export interface GeolocationApiResponse {
  status: string;
  results: GeolocationResult[];
}
