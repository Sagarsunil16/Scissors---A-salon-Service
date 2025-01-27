import { ISalon } from "../Interfaces/Salon/ISalon";
import { ISalonDocument } from "../models/Salon";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { sendOtpEmail,generateOtp } from "../Utils/otp";
class SalonService {
    private repository:ISalonRepository
    constructor(repsository:ISalonRepository){
        this.repository = repsository
    }
    async createSalon(userData:ISalon):Promise<ISalonDocument>{
        return await this.repository.createSalon(userData)
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

 
}

export default SalonService