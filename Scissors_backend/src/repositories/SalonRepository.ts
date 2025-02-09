import Salon from "../models/Salon";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ISalon } from "../Interfaces/Salon/ISalon";
import { ISalonDocument } from "../models/Salon";
import { IUserDocument } from "../models/User";
import { resourceLimits } from "worker_threads";

class SalonRepository implements ISalonRepository{
    async createSalon(salonData:ISalon):Promise<ISalonDocument>{
        return await Salon.create(salonData)
    }
    async getSalonByEmail(email: string): Promise<ISalonDocument | null> {
        return await Salon.findOne({ email });
    }

    async getAllSalon(page:number):Promise<{data:ISalonDocument[],totalCount:number}>{
        try {
            const skip = (page - 1) * 10
            const salons =  await Salon.find({}).skip(skip).limit(10)
            const totalCount = await Salon.countDocuments()
            return {data:salons,totalCount}
        } catch (error:any) {
            console.log("Error fetching salon data",error);
            throw new Error("Could not fetch salons")
        }
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
    async updateSalonStatus(id: string, isActive: boolean): Promise<ISalonDocument | null> {
        return await Salon.findByIdAndUpdate(id,{is_Active:isActive},{new:true})
    }
    async totalPages():Promise<number>{
        return Math.ceil((await Salon.find({})).length/10)
    }
}

export default SalonRepository