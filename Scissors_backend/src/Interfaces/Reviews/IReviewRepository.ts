
import { ISalonDocument } from "../../models/Salon";
import { IAppointment, IAppointmentDocument } from "../Appointment/IAppointment";
import { IReview, IReviewDocument } from "./IReview";

export interface IReviewRepository {
    create(data: Partial<IReview>): Promise<IReviewDocument>; 
    findReviewByAppointmentId(appointmentId:string):Promise<IReviewDocument | null>
    findAppointmentById(appointmentId:string):Promise<IAppointmentDocument | null>
    findSalonById(salonId:string):Promise<ISalonDocument | null>
    findSalonReviews(salonId:string):Promise<IReviewDocument[]>
    findStylistReviews(stylistId: string): Promise<IReviewDocument[]>
    updateSalonRating(salonId:string,rating:number,reviewCount:number):Promise<void>
    updateStylistRating(stylistId:string,rating:number,reviewCount:number):Promise<void>
}