import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { ISalon } from "../Interfaces/Salon/ISalon";
import { refreshToken } from "firebase-admin/app";

export interface ISalonDocument extends ISalon, Document {
  _id: ObjectId;
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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [],
      },
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  openingTime: {
    type: String,
    default: "10:00",
  },
  closingTime: {
    type: String,
    default: "22:00",
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
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
        default: 30,
      },
      stylists: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stylist",
        },
      ],
    },
  ],
  timeZone: {
  type: String,
  required: true,
  default: "Asia/Kolkata", // Changed from UTC
  enum: ["Asia/Kolkata"] // Only allow India timezone
},
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount:{
    type:Number,
    default:0
  },
  refreshToken: {
    type: String,
    default: null,
  },
  refreshTokenExpiresAt:{
    type:Date || null,
    default: null
  },
  role: {
    type: String,
    default: "Salon",
  },
});

salonSchema.index({'address.location':'2dsphere'});

export default mongoose.model<ISalonDocument>("Salon", salonSchema);
