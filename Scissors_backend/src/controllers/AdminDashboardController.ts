import { NextFunction, Request, Response } from "express"
import { IAdminDashboardService } from "../Interfaces/AdminDashboard/IAdminDashboardService"

class AdminDashboardController{
    private _adminDashboardService:IAdminDashboardService
    constructor(adminDashboardService:IAdminDashboardService){
        this._adminDashboardService = adminDashboardService
    }

    async getDashboardData(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const data = await this._adminDashboardService.getAdminDashboardData()
            res.status(200).json(data)
        } catch (error) {
            next(error)
        }
    }
}

export default AdminDashboardController