import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { offerService } from "../config/di";


interface AuthenticatedRequest extends Request {
    user?:{id:string}
}

class OfferController{
    async createOffer(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const userId = req.user?.id
            const {salonId,title,description,discount,serviceIds,expiryDate} = req.body
            if(!userId){
                throw new CustomError("Unauthorized",401)
            }
            const offer =  await  offerService.createOffer({salonId,title,description,discount,serviceIds,expiryDate})
            res.status(200).json({message:"Offer created Successfully",offer})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to create offer", error.status || 500));
        }
    }

    async getSalonOffers(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const {id} = req.params
            const offers = await offerService.getSalonOffer(id)
            res.status(200).json({message:"Offers retriewed successfully",offers})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to fetch salon offer", error.status || 500));
        }
    }
}


export default new OfferController()