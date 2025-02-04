import { ISalon } from "./ISalon";
import { ISalonDocument } from "../../models/Salon";
import { IUserDocument } from "../../models/User";


export interface ISalonRepository{
    createSalon(salonData:ISalon):Promise<ISalonDocument>;
    getSalonByEmail(email:string):Promise<ISalonDocument | null>;
    updateSalonOtp(email:string,otp:string,otpExpiry:Date):Promise<ISalonDocument | null>
    verifyOtpAndUpdate(email:string,):Promise<ISalonDocument | null>
    updateSalonProfile(updatedData:Partial<ISalon>):Promise<ISalonDocument | null>
   
}