import Salon from "../models/Salon";
import Service from "../models/Service";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ISalon, ISalonService, SalonQueryParams } from "../Interfaces/Salon/ISalon";
import { ISalonDocument } from "../models/Salon";
import { IService } from "../Interfaces/Service/IService";
import MasterService from "../models/MasterService";
import { StdioNull } from "node:child_process";
import mongoose from "mongoose";
import { BaseRepository } from "./BaseRepository";
;


class SalonRepository extends BaseRepository<ISalonDocument> implements ISalonRepository{
    constructor(){
        super(Salon)
    }
    async createSalon(salonData:ISalon):Promise<ISalonDocument>{
        return await Salon.create(salonData)
    }
    async getSalonByEmail(email: string): Promise<ISalonDocument | null> {
        return await Salon.findOne({ email }).populate('services.service');
    }
    async updateSalon(id: string, update: Partial<ISalonDocument>, options?: mongoose.QueryOptions): Promise<ISalonDocument | null> {
        return await this.updateById(id,update,options)
    }

    async getSalonById(id:string):Promise<ISalonDocument | null>{
        return await Salon.findById(id).populate('services.service')
        .populate('services.stylists')
        .exec();
    }

    async getNearbySalons(longitude: number, latitude: number, radius: number): Promise<ISalonDocument[]> {
        return await Salon.find({
            'address.location':{
                $near:{
                    $geometry:{
                        type:'Point',
                        coordinates:[longitude,latitude]
                    },
                    $maxDistance:radius
                }
            }
        }).select(`salonName address services rating`).lean()
    }
    
    async getAllSalon(page:number,query:any):Promise<{data:ISalonDocument[],totalCount:number}>{
        try {
            const skip = (page - 1) * 10
            const salons =  await Salon.find(query).skip(skip).limit(10)
            const totalCount = await Salon.countDocuments(query)
            return {data:salons,totalCount}
        } catch (error:any) {
            console.log("Error fetching salon data",error);
            throw new Error("Could not fetch salons")
        }
    }

    async getSalonService(SalonId: string, serviceId: string): Promise<ISalonService | null> {
        const salon = await this.getSalonById(SalonId)
        return salon?.services.find(s=>s._id.toString() == serviceId) || null;
    }

    async updateSalonOtp(email:string,otp:string,otpExpiry:Date):Promise<ISalonDocument | null>{
        return await Salon.findOneAndUpdate({email},{otp,otpExpiry},{new:true})
    }

    async verifyOtpAndUpdate(email:string):Promise<ISalonDocument | null>{
        return await Salon.findOneAndUpdate({email},{otp:null,otpExpiry:null,verified:true},{new:true});
    }
    async updateSalonProfile(updatedData:Partial<ISalon>):Promise<ISalonDocument | null>{
        return await Salon.findOneAndUpdate({email:updatedData.email},{...updatedData},{new:true})
    }
    async updateSalonStatus(id: string, isActive: boolean): Promise<ISalonDocument | null> {
        return await Salon.findByIdAndUpdate(id,{is_Active:isActive},{new:true})
    }
    async addImagesToSalon(salonId: string, imageData: {id:string,url:string}): Promise<ISalonDocument | null> {
        const salon = await Salon.findById(salonId)
        if(!salon){
           throw new Error("Salon not found")
        }
        salon.images.push(imageData)
        await salon.save();
        return salon
    }

    async deleteSalonImage(salonId:string,imageId:string):Promise<ISalonDocument | null>{
        const salon = await Salon.findById(salonId)
        if(!salon){
            return null
        }
        salon.images = salon.images.filter((img)=>img._id.toString() !== imageId)
        await salon.save()
        return salon
    }

    async addService(salonId:string,serviceData:{name:string,description:string,service:string,price:number,duration:number,stylist:{}[]}):Promise<ISalonDocument | null>{
        return await Salon.findByIdAndUpdate(salonId,{$push:{services:serviceData}},{new:true})
    }

    async updateService(
        salonId: string,
        serviceId: string,
        serviceData: {
          name: string;
          description: string;
          service: mongoose.Types.ObjectId;
          price: number;
          duration: number;
          stylists: mongoose.Types.ObjectId[];
        }
      ): Promise<ISalonDocument | null> {
        return await Salon.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(salonId),
            "services._id": new mongoose.Types.ObjectId(serviceId),
          },
          {
            $set: {
              "services.$.name": serviceData.name,
              "services.$.description": serviceData.description,
              "services.$.service": serviceData.service,
              "services.$.price": serviceData.price,
              "services.$.duration": serviceData.duration,
              "services.$.stylists": serviceData.stylists
            },
          },
          { new: true }
        ).populate("services.service services.stylists");
      }
      

    async findOrCreateService(serviceData:{serviceName:string,serviceDescription:string,category:string,price:number}):Promise<any>{
        let service =  await MasterService.findOne({serviceName:serviceData.serviceName,
            category:serviceData.category
        })

        if(!service){
            service =  await MasterService.create(serviceData)
        }

        return service._id
    }

    async linkServiceToSalon(salonId:string,serviceId:string):Promise<any>{
        const salon =  await Salon.findByIdAndUpdate(salonId,
            {$addToSet:{serviceIds:serviceId}},
            {new:true}
        ).populate("serviceIds")

        return salon
    }

    async totalPages():Promise<number>{
        return Math.ceil((await Salon.find({})).length/10)
    }

    async findAllSalons(filters: SalonQueryParams, page: number, itemsPerPage: number): Promise<{salons:ISalonDocument[];total:number}> {
        const query:any = {}

        if(filters.search){
            query.$or = [
                {salonName:{$regex:filters.search,$options:"i"}},
                {'services.name':{$regex:filters.search,$options:"i"}}
            ]
        }

        if(filters.location){
            query.$or = [
                {'address.city':{$regex:filters.location,$options:"i"}},
                {'address.areaStreet':{$regex:filters.location,$options:"i"}}
            ]
        }

        if(filters.maxPrice){
            query['services.price'] = {$lte:filters.maxPrice}
        }

        if(filters.rating && filters.rating.length > 0){
            query.averageRating =  {$in:filters.rating}
        }

        const salons =  await Salon.find(query).populate('services.service').skip((page-1)*itemsPerPage).limit(itemsPerPage).lean()
        const total =  await Salon.countDocuments(query)

        return {salons,total}
    }
    async removeService(salonId: string, serviceId: string): Promise<ISalonDocument | null> {
        return await Salon.findByIdAndUpdate(salonId,{
            $pull:{services:{_id:serviceId}}
        },{new:true})
    }

    async allSalonListForChat(): Promise<Partial<ISalonDocument>[]> {
        return await Salon.find({},'_id salonName email images')
    }
}

export default SalonRepository