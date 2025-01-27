import { salonService } from "../config/di";
import { Request,Response } from "express";
import SalonService from "../services/SalonService";

class SalonController {
    async createSalon(req:Request,res:Response):Promise<any>{
        try {
           const newSalon =  await salonService.createSalon(req.body)
           res.status(201).json({message:"Account Registered Successfully",salon:newSalon}) 
        } catch (error:any) {
        return res.status(500).json({message:error.message})       }
    }

    async sentOtp(req:Request,res:Response):Promise<any>{
        try {
            const {email} = req.body
            console.log(email)
            const message =  await salonService.sendOtp(email)
            res.status(200).json({message})
        } catch (error:any) {
            return res.status(500).json({message:error.message})
        }
    }

    async verifyOtAndUpdate(req:Request,res:Response):Promise<any>{
        try {
            const {email,otp} = req.body
            const message = await salonService.verifyOtp(email,otp)
            return res.status(200).json({message})
        } catch (error:any) {
            return res.status(500).json({message:error.message})
        }
    }
}

export default new SalonController()