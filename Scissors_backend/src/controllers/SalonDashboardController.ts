import { NextFunction, Request, Response } from "express";
import { ISalonDashboardService } from "../Interfaces/SalonDashboard/ISalonDashboardService";

export interface AuthenticatedRequest extends Request{
    user?:{
        id:string;
    }
}

class SalonDashboardController{
    private _salonDashboardService: ISalonDashboardService
    constructor(salonDashboardService:ISalonDashboardService){
        this._salonDashboardService = salonDashboardService
    }

    async getDashboardData(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const salonId = req.user?.id
            const data = await this._salonDashboardService.getSalonDashboardData(salonId as string)
            console.log(data)
            res.status(200).json(data)
        } catch (error) {
            next(error)
        }
    }
}


export default SalonDashboardController


