import { ISalon } from "../Interfaces/Salon/ISalon";
import { ISalonDocument } from "../models/Salon";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { sendOtpEmail,generateOtp } from "../Utils/otp";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
class SalonService {
    private repository:ISalonRepository
    constructor(repsository:ISalonRepository){
        this.repository = repsository
    }
    async createSalon(salonData:ISalon):Promise<ISalonDocument>{
        salonData.password = await bcrypt.hash(salonData.password,10)
        return await this.repository.createSalon(salonData)
    }

    async sendOtp(email:string):Promise<string>{
            const salon = await this.repository.getSalonByEmail(email)
            if(!salon){
                throw new Error("User not found");
            }
            const otp = generateOtp()
            const otpExpiry = new Date(Date.now() + 1 * 60 * 1000) // 1minutes
            await this.repository.updateSalonOtp(email,otp,otpExpiry)
            await sendOtpEmail(email,otp)
            return "OTP Sent to your email."
    }

    async verifyOtp(email:string,otp:string):Promise<string>{
        const salon =  await this.repository.getSalonByEmail(email)
        if(!salon){
            throw new Error("Salon not Found")
        }
        if(!salon.otp || !salon.otpExpiry || salon.otp!==otp){
            throw new Error("Invalid or Exired Otp")
        }
        if(salon.otpExpiry< new Date()){
            throw new Error("OTP has Expired")
        }
        await this.repository.verifyOtpAndUpdate(email)
        return "Verifcation Successfull"
    }

    async loginSalon(email:string,password:string):Promise<{salon:ISalonDocument,token:string}>{
        const salon = await this.repository.getSalonByEmail(email)
        if(!salon){
            throw new Error ("Salon not found")
        }
        const isPasswordValid =  await bcrypt.compare(password,salon.password);
        if(!isPasswordValid){
            throw new Error ("Invalid Email or Password");
        }

        if(!salon.verified){
            throw new Error("Please veerify your account First!")
        }

        const token  =  jwt.sign({id:salon._id},process.env.JWT_SECRET as string,{
            expiresIn:'1h'
        })

        return {salon,token}
    }

    async salonProfileUpdate(updatedData:Partial<ISalon>):Promise<ISalonDocument | null>{
       if(!updatedData.salonName || !updatedData.email || !updatedData.phone){
        throw new Error("Missing required fields")
       }
       const updatedSalon =  await this.repository.updateSalonProfile(updatedData)
       return updatedSalon
    }

    async updateSalonStatus(id:string,isActive:boolean):Promise<ISalonDocument | null>{
      return await this.repository.updateSalonStatus(id,isActive)
    }

    async getAllSalons(page:number):Promise<{data:ISalonDocument[],totalCount:number}>{
        return await this.repository.getAllSalon(page)
    }
 
}

export default SalonService