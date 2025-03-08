import { Request,Response } from "express";
import { serService } from "../config/di";
class ServiceController {
    async createService(req:Request,res:Response):Promise<void>{
        try {
            const result = await serService.createService(req.body)
            res.status(200).json({message:"Service Created Successfully",result})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }

    async getAllServices(req:Request,res:Response):Promise<void>{
        try {
            const {page} = req.query
            const result = await serService.getAllServices(Number(page))
            const totalServicePages = Math.ceil(result.totalCount/10)
            res.status(200).json({message:"Fetched Service details",services:result.services,totalPages:totalServicePages})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }

    async updateService(req:Request,res:Response):Promise<void>{
        try {
            const result = serService.updateService(req.body)
            res.status(200).json({message:"Service Updated Successfully",result})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }

    async deleteService(req:Request,res:Response):Promise<void>{
        try {
            const id = req.query.id as string
            const result = await serService.deleteService(id)
            res.status(200).json({message:"Service deleted Successfully",result})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }
}

export default new ServiceController()