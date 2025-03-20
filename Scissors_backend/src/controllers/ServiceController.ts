import { Request,Response,NextFunction } from "express";
import CustomError from "../Utils/cutsomError";
import { serService } from "../config/di";
class ServiceController {
    async createService(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const result = await serService.createService(req.body)
            res.status(200).json({message:"Service Created Successfully",result})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to create the service.", 500));
        }
    }

    async getAllServices(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const {page} = req.query
            const result = await serService.getAllServices(Number(page))
            if (!result || result.services.length === 0) {
                throw new CustomError("No services found for the given criteria.", 404);
            }
            const totalServicePages = Math.ceil(result.totalCount/10)
            res.status(200).json({message:"Fetched Service details successfully.",services:result.services,totalPages:totalServicePages})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to fetch services. Please try again later.", 500));
        }
    }

    async updateService(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const {id} = req.body
            if (!id) {
                throw new CustomError("Service ID is required to update.", 400);
            }
            const result = serService.updateService(req.body)
            if (!result) {
                throw new CustomError("Service not found.", 404);
            }
            res.status(200).json({message:"Service Updated Successfully",result})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to update the service. Please try again later.", 500));
        }
    }

    async deleteService(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const id = req.query.id as string
            if (!id) {
                throw new CustomError("Service ID is required to delete.", 400);
            }
            const result = await serService.deleteService(id)
            if (!result) {
                throw new CustomError("Service not found.", 404);
            }
            res.status(200).json({message:"Service deleted Successfully",result})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to delete the service. Please try again later.", 500));
        }
    }
}

export default new ServiceController()