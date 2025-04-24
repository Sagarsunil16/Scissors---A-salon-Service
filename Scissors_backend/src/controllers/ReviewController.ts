import { Request,Response,NextFunction } from "express";
import CustomError from "../Utils/cutsomError";
import { appointmentService, reviewService } from "../config/di";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
    user?:{id:string}
}
class ReviewController {
    async createReview(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const {salonId,stylistId,appointmentId,salonRating,salonComment,stylistRating,stylistComment} = req.body
            const userId = req.user?.id
            if(!userId){
               throw new CustomError("Unauthorized",401);
            }
    
            const review =  await reviewService.createReview({
                userId: new mongoose.Types.ObjectId(userId),
                salonId,
                stylistId,
                appointmentId,
                salonRating,
                salonComment,
                stylistRating,
                stylistComment,
            });
            await appointmentService.updatedAppointmentReview(appointmentId)
            res.status(200).json({message:"Review created Successfully",review})
        } catch (error:any) {
            next(new CustomError(error.message || "Internal Server Issue",500))
        }
       
    }

    async getSalonReviews(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const {id} =  req.params
            console.log(id,"id in the salon")
            const reviews =  await reviewService.getSalonReviews(id)
            res.status(200).json({ message: "Salon reviews retrieved successfully", reviews });
        } catch (error:any) {
            next(new CustomError(error.message || "Internal Server Issue",500))
        }
    }

    async getStylistReviews(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const {id} =  req.params
            const reviews = await reviewService.getStylistReviews(id)
            res.status(200).json({ message: "Stylist reviews retrieved successfully", reviews });
        }  catch (error:any) {
            next(new CustomError(error.message || "Internal Server Issue",500))
        }
    }
}


export default new ReviewController()