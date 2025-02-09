import { ISalon } from "./ISalon";
import { ISalonDocument } from "../../models/Salon";



export interface ISalonRepository{
    createSalon(salonData:ISalon):Promise<ISalonDocument>;
    getSalonByEmail(email:string):Promise<ISalonDocument | null>;
    getAllSalon(page:number):Promise<{data:ISalonDocument[],totalCount:number}>
    updateSalonOtp(email:string,otp:string,otpExpiry:Date):Promise<ISalonDocument | null>
    verifyOtpAndUpdate(email:string,):Promise<ISalonDocument | null>
    updateSalonProfile(updatedData:Partial<ISalon>):Promise<ISalonDocument | null>
    updateSalonStatus(id:string,isActive:boolean):Promise<ISalonDocument | null>
    totalPages():Promise<number>
   
}