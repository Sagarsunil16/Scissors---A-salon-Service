import { salonService } from "../config/di";
import { Request,Response } from "express";


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

    async loginSalon(req:Request,res:Response):Promise<any>{
        try {
            const {email,password} = req.body
            const  result = await salonService.loginSalon(email,password)
            res.cookie("authToken",result?.token,{httpOnly:true,maxAge:60 * 60 * 1000}).status(200).json({message:"Login Successfull",details:result?.salon})
        } catch (error:any) {
            return res.status(500).json({message:error.message})
        }
    }

    async signOutSalon(req: Request, res: Response): Promise<any> {
        res
          .clearCookie("authToken", { path: "/salon/login" })
          .status(200)
          .json({ message: "Logged Out Successfully!" });
      }

    async updateSalon(req:Request,res:Response):Promise<any>{
        try {
           const updatedData = await salonService.salonProfileUpdate(req.body)
           return res.status(200).json({message:"Profile Updated Successfully",updatedData:updatedData})
        } catch (error:any) {
            return res.status(500).json({message:error.message})
        }
    }
}

export default new SalonController()