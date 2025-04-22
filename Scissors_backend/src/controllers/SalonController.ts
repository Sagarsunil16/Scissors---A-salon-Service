import { salonService } from "../config/di";
import { NextFunction, Request,Response } from "express";
import CustomError from "../Utils/cutsomError";


class SalonController {
    async createSalon(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
           const newSalon =  await salonService.createSalon(req.body)
           res.status(201).json({message:"Salon Registered Successfully",salon:{ _id: newSalon._id,
            salonName: newSalon.salonName,
            email: newSalon.email,
            phone: newSalon.phone,
            address: newSalon.address,
            category: newSalon.category,
            openingTime: newSalon.openingTime,
            closingTime: newSalon.closingTime,
            rating: newSalon.rating}}) 
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to register the salon. Please try again.", 500))       }
    }

    async sentOtp(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {email} = req.body
            const message =  await salonService.sendOtp(email)
            res.status(200).json({message})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to send OTP. Please try again later.", 500))
        }
    }

    async verifyOtAndUpdate(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {email,otp} = req.body
            const message = await salonService.verifyOtp(email,otp)
            return res.status(200).json({message})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to verify OTP. Please try again.", 500));
        }
    }

    async loginSalon(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {email,password} = req.body
            const  result = await salonService.loginSalon(email,password)
            res.cookie("authToken",result?.accessToken,{httpOnly:true,maxAge:15 * 60 * 1000}).cookie("refreshToken",result.refreshToken,{
                httpOnly:true,maxAge:7*24*60*60*1000
            }).status(200).json({message:"Login Successfull",details:result?.salon})
        } catch (error:any) {
            next(new CustomError(error.message || "Login failed. Please check your credentials and try again.", 500))
        }
    }

    async signOutSalon(req: Request, res: Response,next:NextFunction): Promise<any> {
        res
          .clearCookie("authToken", { path: "/salon/login" })
          .status(200)
          .json({ message: "Logged Out Successfully!" });
      }


    async getAllSalons(req:Request,res:Response,next:NextFunction):Promise<void>{
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
            next(new CustomError(error.message || "Failed to fetch salon data. Please try again later.", 500)); // Forward the error
        }
    }

    async getNearbySalons(req:Request,res:Response,next:NextFunction){
        try {
            const {longitude,latitude,radius = 5000} = req.body
            if(!longitude ||  !latitude){
                next(new CustomError("Longitude and latitude are required.", 400))
            }

            const salons = await salonService.getNearbySalons(
                parseFloat(latitude),
                parseFloat(longitude),
                parseInt(radius)
            );
            res.status(200).json({ message: "Nearby salons retrieved successfully", salons });
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to retrieve nearby salons.", 500))
        }
    }

    async getSalonData(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const id = req.query.id
            console.log(id)
            const result = await salonService.getSalonData(id as string)
            req.body.result = result
            res.status(200).json({message:"Salon data fetched Successfully",salonData:result})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to fetch salon data. Please try again later.", 500)); // Forward the error
        }
    }

    async updateSalon(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
           const updatedData = await salonService.salonProfileUpdate(req.body)
           return res.status(200).json({message:"Profile Updated Successfully",updatedData:updatedData})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to update salon profile. Please try again later.", 500)); // Forward the error
        }
    }

    async uploadImage(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {salonId} = req.body
            const file = req.file?.path
            if(!file){
                return next(new CustomError("No file uploaded. Please upload an image.", 400)); // Forward the error for missing file
            }
            const result = await salonService.uploadSalonImage(salonId,file,)

            res.status(200).json({message:"Image Uploaded Successfully",updatedSalonData:result})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to upload image. Please try again later.", 500)); // Forward the error
        }
    }
    async deleteImage(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {salonId,imageId,cloudinaryImageId} = req.body
            if(!salonId || !imageId){
                return next(new CustomError("Salon ID and Image ID are required.", 400));
            }
            const result = await salonService.deleteSalonImage(salonId,imageId,cloudinaryImageId)
            return res.status(200).json({message:"Image deleted Successfully",updatedSalonData:result})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to delete image. Please try again later.", 500));
        }
    }

    async getAllService(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const salonId =  req.params
            if(!salonId){
                return next(new CustomError("Salon ID is required.", 400)); // Forward the error for missing salon ID
            }
            // const result = await salonService.getAllService
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to fetch services. Please try again later.", 500));
        }
    }

    async addService(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {id,...serviceData} = req.body
            const result  =  await salonService.addService(id,serviceData)
            return res.status(200).json({message:"Service Added Successfully",updatedSalonData:result})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to add service. Please try again later.", 500));
        }
    }

    async updateService(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            
            const requiredFields = ['salonId', 'serviceId', 'name', 'description', 'price', 'service', 'duration', 'stylists'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                return next(new CustomError(`Missing fields: ${missingFields.join(', ')}`, 400));
            }
    
            // Convert types
            const data = {
                ...req.body,
                price: Number(req.body.price),
                duration: Number(req.body.duration),
                stylists: Array.isArray(req.body.stylists) ? req.body.stylists : []
            };

            console.log(data,"dataservice")
    
            const result = await salonService.updateService(data);
            res.status(200).json({ message: "Service Updated Successfully", result });
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to update service. Please try again later.", 500));
        }
    }

    async deleteService(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {salonId,serviceId} = req.body
          const result = salonService.removeService(salonId,serviceId)
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to delete service. Please try again later.", 500)); 
        }
      }

}

export default new SalonController()