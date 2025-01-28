import Salon from "../models/Salon";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ISalon } from "../Interfaces/Salon/ISalon";
import { ISalonDocument } from "../models/Salon";
import { IUserDocument } from "../models/User";

class SalonRepository implements ISalonRepository{
    async createSalon(salonData:ISalon):Promise<ISalonDocument>{
        return await Salon.create(salonData)
    }
    async getSalonByEmail(email: string): Promise<ISalonDocument | null> {
        return await Salon.findOne({ email });
    }

    async updateSalonOtp(email:string,otp:string,otpExpiry:Date):Promise<ISalonDocument | null>{
        return await Salon.findOneAndUpdate({email},{otp,otpExpiry},{new:true})
    }

    async verifyOtpAndUpdate(email:string):Promise<ISalonDocument | null>{
        return await Salon.findOneAndUpdate({email},{otp:null,otpExpiry:null,verified:true},{new:true});
    }
    async updateSalonProfile(updatedData:Partial<ISalon>):Promise<ISalonDocument | null>{
        return await Salon.findOneAndUpdate({email:updatedData.email},{...updatedData},{new:true})
    }
}

export default SalonRepository