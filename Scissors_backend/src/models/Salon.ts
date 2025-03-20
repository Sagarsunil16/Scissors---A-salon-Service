import mongoose, { Schema, Document,ObjectId } from "mongoose";
import { ISalon } from "../Interfaces/Salon/ISalon";

export interface ISalonDocument extends ISalon, Document {
  _id:ObjectId
  _doc?: ISalon;
}

const salonSchema: Schema = new Schema({
  salonName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    areaStreet: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  openingTime: {
    type: String,
    default: "00:00",
  },
  closingTime: {
    type: String,
    default: "00:00",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  is_Active: {
    type: Boolean,
    default: true,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  images: [
    {
      id: { type: String },
      url: { type: String },
    },
  ],
  services: [
    {
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
      name:{
        type:String,
        required:true
      },
      description:{
        type:String,
        required:true
      },
      price: {
        type: Number,
        required: true,
      },
      duration:{
        type:Number,
        requred:true,
        default:30
      },
      stylists:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Stylist'
      }],
    },
  ],
  timeZone:{
    type:String,
    required:true,
    default:'UTC'
  },
  rating:{
    type:String,
    required:true,
    default:3
  }
});

export default mongoose.model<ISalonDocument>("Salon", salonSchema);
