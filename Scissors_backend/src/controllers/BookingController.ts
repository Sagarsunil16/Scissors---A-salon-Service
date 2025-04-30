import { NextFunction, Request,Response } from "express";
import { ITimeSlot } from "../Interfaces/TimeSlot/ITimeSlot";
import CustomError from "../Utils/cutsomError";
import Stripe from "stripe";
import mongoose from "mongoose";
import { AppointmentStatus, IAppointment, PaymentMethod, PaymentStatus } from "../Interfaces/Appointment/IAppointment";
import Appointment from "../models/Appointment";
import { IOfferService } from "../Interfaces/Offers/IOfferService";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { ITimeSlotService } from "../Interfaces/TimeSlot/ITimeSlotService";
const stripe =  new Stripe(process.env.STRIPE_SECRET_KEY as string)
class BookingController{
    private offerService: IOfferService
    private reviewService: IReviewService
    private timeSlotService : ITimeSlotService
    private salonService: ISalonService
    constructor(offerService:IOfferService,reviewService:IReviewService,timeSlotService:ITimeSlotService,salonService:ISalonService){
        this.offerService = offerService,
        this.reviewService = reviewService
        this.timeSlotService = timeSlotService
        this.salonService = salonService
        this.webHooks = this.webHooks.bind(this)
    }
    async getAvailableSlots(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const slots = await this.timeSlotService.generateSlots(req.params.salonId,[req.params.service],new Date(req.query.date as string),req.params.stylistId)
            res.json(slots)
        } catch (error:any) {
            return next(new CustomError(error.message || "There was an issue fetching the available slots. Please try again later.",500));
        }
    }

    async getSalonDataWithSlots(req: Request, res: Response,next:NextFunction): Promise<any> {
        try {
            // console.log(req.query)
            const { id, serviceId,stylistId, date } = req.query;
            if (!id) {
                return next(new CustomError( "Salon ID is required to fetch the salon data.",400));
            }

            // console.log(`Fetching details for salonId: ${id}, serviceId: ${serviceId}, date: ${date}`);

            // Fetch Salon Data
            const salonData = await this.salonService.getSalonData(id as string);
            if (!salonData) {
                return next(new CustomError("Salon not found. Please check the salon ID and try again.",404));
            }

            let availableSlots:ITimeSlot[] = [];
            if (stylistId && date) {
                // Fetch Available Slots only if stylistId is provided
                availableSlots = await this.timeSlotService.generateSlots(
                    id as string, 
                    [serviceId as string], 
                    new Date(date as string),
                    stylistId as string
                );
            }
            const reviews = await this.reviewService.getSalonReviews(id as string)
            const offers = await this.offerService.getSalonOffer(id as string)
            return res.status(200).json({
                message: "Salon data and slots fetched successfully",
                salonData,
                reviews,
                availableSlots,
                offers
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
    
            const salon = await this.salonService.getSalonData(salonId);
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
            const stylistsMap = new Map<string, { _id: string; name: string, rating:number }>();
            services.forEach(service => {
                service.stylists.forEach(stylist => {
                    if (!stylistsMap.has(stylist._id.toString())) {
                        stylistsMap.set(stylist._id.toString(), {
                            _id: stylist._id.toString(),
                            name: stylist.name,
                            rating:stylist.rating
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

    async createCheckoutSession(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const { amount, currency,metadata } = req.body;
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
                success_url:"http://localhost:5173/booking-success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url:"http://localhost:5173/booking-confirmation",
                metadata:metadata
            })
            res.json({id:session.id})
        } catch (error:any) {
           return next(new CustomError(error.message || "Something went wrong during stripe payment, please try again later.",500))
        }
    }

    async webHooks(req: Request, res: Response): Promise<any> {
        console.log("am entered")
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        if (!endpointSecret) {
            console.error("Stripe webhook secret not configured");
            return res.status(500).send("Server configuration error");
        }
    
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
        } catch (error: any) {
            console.error(`Webhook signature verification failed: ${error.message}`);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }
        const dbSession = await mongoose.startSession();
        dbSession.startTransaction();
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object;
                   
                    // Verify payment was successful
                    if (session.payment_status !== 'paid') {
                        console.warn(`Unpaid session: ${session.id}`);
                        break;
                    }
    
                    // Validate metadata exists
                    if (!session.metadata) {
                        throw new Error("Missing metadata in session");
                    }
    
                    const { metadata } = session;
                    

                    await this.timeSlotService.updateSlotStatus(
                        metadata.slot.toString(),
                        'booked'
                    );
                    // Create appointment
                    const appointmentData = await this.prepareAppointmentData(metadata, session);
                    const appointment = await Appointment.create([appointmentData], { session: dbSession });
          
                    await dbSession.commitTransaction();
                    // console.log(`Appointment created for session: ${session.`id}`);
                    break;
                    
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
    
            res.status(200).send();
        } catch (error: any) {
            await dbSession.abortTransaction();
            console.error(`Webhook processing error: ${error.message}`);
            res.status(400).send(`Processing failed: ${error.message}`);
        } finally {
            dbSession.endSession();
        }
    }
    
    private async prepareAppointmentData(metadata: any, session: Stripe.Checkout.Session): Promise<IAppointment> {

        console.log(metadata,session,"metadata and session details")
        // Validate required metadata fields
        const requiredFields = ['user', 'salon', 'stylist', 'services', 'slot'];
        for (const field of requiredFields) {
            if (!metadata[field]) {
                throw new Error(`Missing required field in metadata: ${field}`);
            }
        }
        return {
            user: new mongoose.Types.ObjectId(metadata.user),
            salon: new mongoose.Types.ObjectId(metadata.salon),
            stylist: new mongoose.Types.ObjectId(metadata.stylist),
            services: metadata.services.split(",").map((s: string) => new mongoose.Types.ObjectId(s)),
            slot: new mongoose.Types.ObjectId(metadata.slot),
            status: AppointmentStatus.Confirmed,
            totalPrice: session.amount_total ? session.amount_total / 100 : 0, // convert back to dollars
            paymentStatus: PaymentStatus.paid,
            paymentMethod: PaymentMethod.Online,
            serviceOption: metadata.serviceOption === 'home' ? 'home' : 'store',
            address: metadata.serviceOption === 'home' ? JSON.parse(metadata.address) : undefined,
            stripeSessionId:session.id
        } as IAppointment;
    }
}


export default BookingController