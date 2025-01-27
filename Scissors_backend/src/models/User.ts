import mongoose, { Schema, Document } from "mongoose";
import { IUser} from "../Interfaces/IUser";

export interface IUserDocument extends IUser, Document {
  _doc?: IUser; // Add the _doc property as optional
}
const addressSchema:Schema = new Schema({
  areaStreet: { type: String, default:null },
  city: { type: String,  default:null },
  state: { type: String,  default:null },
  pincode: { type: String,  default:null },
})
const UserSchema: Schema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
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
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: addressSchema,
    default: () => ({ areaStreet: null, city: null, state: null, pincode: null }),
  },
  role: {
    type: String,
    enum: ["User", "Admin"],
    default: "User",
  },
  is_Active: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  otp:{
    type:String,
    default:null
  },
  otpExpiry:{
    type:Date,
    default:null
  }
});


export default mongoose.model<IUserDocument>("User",UserSchema)