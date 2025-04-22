import {Request,Response,NextFunction} from 'express'
import CustomError from '../Utils/cutsomError'
import mongoose from 'mongoose';
import { appointmentService } from '../config/di';
interface AuthenticatedRequest extends Request {
    user?: { id: string }; 
}

interface AuthenticatedSalonRequest extends Request {
    salon?: { id: string }; // Assuming salon ID is attached after authentication
}
class AppointmentController {
    
    // async getAppointmentDetails(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
        
    //     try {
    //         const appointmentId = req.params.id
    //         const userId =  req.user?.id

    //         console.log("Appointment ID:", appointmentId); // ✅ Debugging
    //         console.log("User ID:", userId); // ✅ Debugging

    //         if(!mongoose.Types.ObjectId.isValid(appointmentId)){
    //             return next(new CustomError("Invalid Appointment ID",400))
    //         }

    //         const appointment = await appointmentService.getAppointmentDetails(appointmentId,userId as string)
    //         console.log("Fetched Appointment:", appointment); // ✅ Debugging
    //         if(!appointment){
    //             return next(new CustomError("Appointment Not Found",404))
    //         }
    //         res.status(200).json({message:"Appointment Details fetcched Successfully",appointment})
    //     } catch (error:any) {
    //         console.log("Error in the getAppointmentDetails Controller")
    //         return next(new CustomError(error.message || "Internal Server issues",500))
    //     }
    // }

    async getUserAppointments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const { status, page = '1', limit = '10' } = req.query;
    
            if (!userId) {
                throw new CustomError('Authentication required', 401);
            }
    
            const result = await appointmentService.getUserAppointments(
                userId.toString(),
                status?.toString(),
                parseInt(page as string),
                parseInt(limit as string)
            );
            
            console.log(result,"appointmetn detasuls")
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getSalonAppointments(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const salonId = req.user?.id
            const {status,page = '1', limit= '10'} = req.query
            if(!salonId){
                throw new CustomError('Authentication required',400)
            }
            const result = await appointmentService.getSalonAppointments(
                salonId.toString(),
                status?.toString(),
                parseInt(page as string),
                parseInt(limit as string)
            );
            res.status(200).json({
                message:"Salon appointments fetched Successfully",
                data:result
            })
        } catch (error:any) {
            next(new CustomError(error.message || "Internal Server Issues",500))
        }
    }

    async cancelAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction):Promise<void> {
        try {
            const { id } = req.params; // Appointment ID
            const salonId = req.user?.id;
            console.log(id)
            if (!salonId) {
                throw new CustomError('Authentication required', 401);
            }

            const updatedAppointment = await appointmentService.cancelAppointment(id, salonId);

            res.status(200).json({
                success: true,
                message: 'Appointment cancelled successfully',
                data: updatedAppointment,
            });
        } catch (error:any) {
            console.log("Error in the cancel Appointment controller")
           return next(new CustomError(error.message || "Internal Server Issues",500))
        }
    }

    async completeAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction):Promise<void> {
        try {
            const { id } = req.params;
            const salonId = req.user?.id;

            if (!salonId) {
                next( new CustomError('Authentication required', 401));
            }

            const updatedAppointment = await appointmentService.completeAppointment(id, salonId as string);

            res.status(200).json({
                message: 'Appointment marked as completed',
                data: updatedAppointment,
            });
        } catch (error:any) {
            console.log("Error in the complete Appointment controller")
            return next(new CustomError(error.message || "Internal Server Issues",500))
        }
    }

    async cancelAppointmentByUser(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const appointmentId = req.params.id
            const userId = req.user?.id
            if(!appointmentId){
                throw new CustomError("Appointment Id not Found",404)
            }
            const updatedAppointment = await appointmentService.cancelAppointmentByUser(appointmentId,userId as string)
            res.status(200).json({
                success: true,
                message: 'Appointment cancelled successfully',
                data: updatedAppointment,
            });
        } catch (error:any) {
            console.log("Error in the cancelByUser in appointment controller")
            return next(new CustomError(error.message || "Internal Server Issues",500))
        }
    }
}

export default new AppointmentController