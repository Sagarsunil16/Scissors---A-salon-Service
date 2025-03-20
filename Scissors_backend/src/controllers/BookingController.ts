import { NextFunction, Request,Response } from "express";
import { timeSlotService } from "../config/di";
import { ITimeSlot } from "../Interfaces/TimeSlot/ITimeSlot";
import CustomError from "../Utils/cutsomError";
import { salonService } from "../config/di";
import Stripe from "stripe";
const stripe =  new Stripe(process.env.STRIPE_SECRET_KEY as string)
class bookingController{
    async getAvailableSlots(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {serviceIds} = req.query
            const slots = await timeSlotService.generateSlots(req.params.salonId,[req.params.service],new Date(req.query.date as string),req.params.stylistId)
            res.json(slots)
        } catch (error:any) {
            return next(new CustomError(error.message || "There was an issue fetching the available slots. Please try again later.",500));
        }
    }

    async getSalonDataWithSlots(req: Request, res: Response,next:NextFunction): Promise<any> {
        try {
            console.log(req.query)
            const { id, serviceId,stylistId, date } = req.query;
            if (!id) {
                return next(new CustomError( "Salon ID is required to fetch the salon data.",400));
            }

            console.log(`Fetching details for salonId: ${id}, serviceId: ${serviceId}, date: ${date}`);

            // Fetch Salon Data
            const salonData = await salonService.getSalonData(id as string);
            if (!salonData) {
                return next(new CustomError("Salon not found. Please check the salon ID and try again.",404));
            }

            let availableSlots:ITimeSlot[] = [];
            if (stylistId && date) {
                // Fetch Available Slots only if stylistId is provided
                availableSlots = await timeSlotService.generateSlots(
                    id as string, 
                    [serviceId as string], 
                    new Date(date as string),
                    stylistId as string
                );
            }

            return res.status(200).json({
                message: "Salon data and slots fetched successfully",
                salonData,
                availableSlots,
            });

        } catch (error: any) {
            console.error("Error fetching salon data or slots:", error);
            return next(new CustomError( error.message || "There was an issue fetching the salon data or available slots. Please try again later.",500));
        }
    }

    async getServiceStylist(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            console.log("entered in the service stylist");
            const { salonId } = req.params;
            const { serviceIds } = req.query;
    
            // Convert comma-separated string to array
            const serviceIdsArray = typeof serviceIds === 'string' ? serviceIds.split(',') : [];
    
            console.log("Received serviceIds:", serviceIds);
            console.log("Parsed serviceIdsArray:", serviceIdsArray);
    
            const salon = await salonService.getSalonData(salonId);
            if (!salon) {
                return next(new CustomError("Salon not found", 404));
            }
    
            // Filter services based on the provided service IDs
            const services = salon.services.filter(service =>
                serviceIdsArray.includes(service._id.toString())
            );
    
            console.log("Filtered Services:", services);
    
            if (services.length === 0) {
                return next(new CustomError("No valid services found", 404));
            }
    
            // Fetch stylists for all selected services and deduplicate
            const stylistsMap = new Map<string, { _id: string; name: string }>();
            services.forEach(service => {
                service.stylists.forEach(stylist => {
                    if (!stylistsMap.has(stylist._id.toString())) {
                        stylistsMap.set(stylist._id.toString(), {
                            _id: stylist._id.toString(),
                            name: stylist.name,
                        });
                    }
                });
            });
    
            const stylists = Array.from(stylistsMap.values());
    
            console.log("Fetched Stylists:", stylists);
    
            if (stylists.length === 0) {
                return next(new CustomError("No stylists found for the selected services", 404));
            }
    
            return res.status(200).json({ message: "Stylists fetched successfully", stylists });
        } catch (error: any) {
            return next(new CustomError(error.message || "There was an issue fetching the service stylist. Please try again later.", 500));
        }
    }

    async createPaymentIntent(req:Request,res:Response,next:NextFunction){
        try {
            const { amount, currency } = req.body;
    
            // const paymentIntent = await stripe.paymentIntents.create({
            //     amount: amount * 100, // Convert to smallest currency unit
            //     currency: currency,
            //     payment_method_types: ["card"],
            // });

            const line_Items = [{
                price_data:{
                    currency:currency,
                    product_data:{
                        name:"Scissors Booking Payment",
                        description:'Payment for selected Services'
                    },
                    unit_amount:amount * 100
                },
                quantity:1
            }]
            const session = await stripe.checkout.sessions.create({
                payment_method_types:["card"],
                line_items:line_Items,
                mode:'payment',
                success_url:"http://localhost:5173/success",
                cancel_url:"http://localhost:5173/cancel"
            })
    
            // res.json({ clientSecret: paymentIntent.client_secret });
            res.json({id:session.id})
        } catch (error:any) {
            res.status(400).json({ error: error.message });
        }
    }
    
}


export default new bookingController()