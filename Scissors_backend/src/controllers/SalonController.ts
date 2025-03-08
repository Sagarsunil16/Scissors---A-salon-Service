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


    async getAllSalons(req:Request,res:Response):Promise<void>{
        try {
            const {search,location,maxPrice,ratings,offers,page='1',itemsPerPage='6'} = req.query
            const pageNumber = parseInt(page as string,10) || 1;
            const itemsPerPageNumber =  parseInt(itemsPerPage as string,10) || 6;

            const {salons,total,totalPages} =  await salonService.getFilteredSalons({
                search:search?.toString(),
                location:location?.toString(),
                maxPrice:maxPrice?Number(maxPrice):undefined,
                ratings:ratings?(ratings as string).split(',').map(Number):[],
                offers:offers?.toString()
            },pageNumber,itemsPerPageNumber)

            res.status(200).json({
                success:true,
                data:{
                    salons,
                    pagination:{
                        currentPage:pageNumber,
                        totalPages,
                        totalItems:total,
                        itemsPerPage:itemsPerPageNumber
                    }
                }
            })
        } catch (error:any) {
            res.status(500).json({message:error.message || "Internal Server Issue"})
        }
    }

    async getSalonData(req:Request,res:Response):Promise<void>{
        try {
            const id = req.query.id
            console.log(id)
            const result = await salonService.getSalonData(id as string)
            res.status(200).json({message:"Salon data fetched Successfully",salonData:result})
        } catch (error:any) {
            console.log(error)
            res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }

    async updateSalon(req:Request,res:Response):Promise<any>{
        try {
           const updatedData = await salonService.salonProfileUpdate(req.body)
           return res.status(200).json({message:"Profile Updated Successfully",updatedData:updatedData})
        } catch (error:any) {
            return res.status(500).json({message:error.message})
        }
    }

    async uploadImage(req:Request,res:Response):Promise<any>{
        try {
            const {salonId} = req.body
            const file = req.file?.path
            if(!file){
                return res.status(400).json({error:"No file uploaded"})
            }
            const result = await salonService.uploadSalonImage(salonId,file,)

            res.status(200).json({message:"Image Uploaded Successfully",updatedSalonData:result})
        } catch (error:any) {
            return res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }
    async deleteImage(req:Request,res:Response):Promise<any>{
        try {
            const {salonId,imageId,cloudinaryImageId} = req.body
            if(!salonId || !imageId){
                return res.status(400).json({error:"Salon Id and Image Id are required."})
            }
            const result = await salonService.deleteSalonImage(salonId,imageId,cloudinaryImageId)
            return res.status(200).json({message:"Image deleted Successfully",updatedSalonData:result})
        } catch (error:any) {
            return res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }

    async getAllService(req:Request,res:Response):Promise<any>{
        try {
            const salonId =  req.params
            if(!salonId){
                return res.status(400).json({error:"Salon ID is required"})
            }
            // const result = await salonService.getAllService
        } catch (error:any) {
            return res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }

    async addService(req:Request,res:Response):Promise<any>{
        try {
            const {id,...serviceData} = req.body
            const result  =  await salonService.addService(id,serviceData)
            return res.status(200).json({message:"Service Added Successfully",updatedSalonData:result})
        } catch (error:any) {
            return res.status(500).json({error:error.message || "Internal Server Error"})
        }
    }

    async updateService(req:Request,res:Response):Promise<void>{
        try {
            console.log(req.body)
            const result =  await salonService.updateService(req.body)
            res.status(200).json({message:"Service Updated Successfully",result})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal Server Error"})
        }
    }

}

export default new SalonController()