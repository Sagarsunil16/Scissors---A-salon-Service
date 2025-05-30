import { ISalon, ISalonService, SalonQueryParams, SalonResult } from "./ISalon";
import { ISalonDocument } from "../../models/Salon";
import mongoose from "mongoose";

export interface ISalonRepository{
    createSalon(salonData:ISalon):Promise<ISalonDocument>;
    getSalonByEmail(email:string):Promise<ISalonDocument | null>;
    getSalonById(id:string):Promise<ISalonDocument | null>
    getSalonService(SalonId:string,serviceId:string):Promise<ISalonService | null>
    getAllSalon(page:number,query:any):Promise<{data:ISalonDocument[],totalCount:number}>
    updateSalonOtp(email:string,otp:string,otpExpiry:Date):Promise<ISalonDocument | null>
    verifyOtpAndUpdate(email:string,):Promise<ISalonDocument | null>
    updateSalonProfile(updatedData:Partial<ISalon>):Promise<ISalonDocument | null>
    updateSalonStatus(id:string,isActive:boolean):Promise<ISalonDocument | null>
    addImagesToSalon(salonId:string,imageData: {url:string}):Promise<ISalonDocument |null>
    deleteSalonImage(salonId:string,imageId:string):Promise<ISalonDocument | null>
    addService(salonId:string,serviceData:{name:string,description:string,service:string,price:number}):Promise<ISalonDocument | null>
    updateService(salonId:string,serviceId:string,serviceData:{name:string,description:string,service:mongoose.Types.ObjectId,price:number}):Promise<ISalonDocument | null>
    findOrCreateService(salonData:{serviceName:string,serviceDescription:string,category:string,price:number}):Promise<any>
    linkServiceToSalon(salonId:string,serviceId:string):Promise<any>
    totalPages():Promise<number>
    findAllSalons(filters:SalonQueryParams,page:number,itemsPerPage:number):Promise<{salons:ISalonDocument[];total:number}>  
    removeService(salonId:string,serviceId:string):Promise<ISalonDocument | null>
    allSalonListForChat():Promise<Partial<ISalonDocument>[]>
    updateSalon(id:string,update:Partial<ISalonDocument>,options?:mongoose.QueryOptions):Promise<ISalonDocument | null>
    getNearbySalons(longitude:number,latitude:number,radius:number,query:any,skip:number,limit:number):Promise<ISalonDocument[]>
    countNearbySalons(longitude:number,latitude:number,radius:number,query:any):Promise<number>
    getAllSalons(query: any, skip: number, limit: number): Promise<ISalonDocument[]> 
    countAllSalons(query: any): Promise<number>
}