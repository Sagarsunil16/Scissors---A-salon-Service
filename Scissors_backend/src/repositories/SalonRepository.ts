import mongoose from "mongoose";
import Salon, { ISalonDocument } from "../models/Salon";
import MasterService from "../models/MasterService";
import { BaseRepository } from "./BaseRepository";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { ISalon, ISalonService, SalonQueryParams } from "../Interfaces/Salon/ISalon";

class SalonRepository extends BaseRepository<ISalonDocument> implements ISalonRepository {
  constructor() {
    super(Salon);
  }

  // Only include if ISalonRepository requires it
  async createSalon(salonData: Partial<ISalon>): Promise<ISalonDocument> {
    return await this.create(salonData);
  }

  async findSalonRaw(id: string): Promise<ISalonDocument | null>{
    return this.model.findById(id).lean()
  }

  async getSalonByEmail(email: string): Promise<ISalonDocument | null> {
    return await this.model.findOne({ email }).populate("services.service").lean().exec();
  }

  async updateSalon(id: string, update: Partial<ISalonDocument>, options: mongoose.QueryOptions = { new: true }): Promise<ISalonDocument | null> {
    return await this.model.findByIdAndUpdate(id, update, options).lean().exec();
  }

  // Only include if ISalonRepository requires it
  async getSalonById(id: string): Promise<ISalonDocument | null> {
    return await this.model.findById(id).populate("services.service").populate("services.stylists").lean().exec();
  }

  async getNearbySalons(longitude: number, latitude: number, radius: number, query: any, skip: number, limit: number): Promise<ISalonDocument[]> {
    return await this.model
      .find({
        ...query,
        "address.location": {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radius / 6378100], // Radius in radians (Earth radius ~6378.1 km)
          },
        },
      })
      .select("salonName address services rating images category")
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async getAllSalons(query: any, skip: number, limit: number): Promise<ISalonDocument[]> {
    console.log(query)
      return this.model.find(query).select('salonName address services rating images category')
      .sort({ratings:-1}).skip(skip).limit(limit).lean().exec()
  }

  async countNearbySalons(longitude: number, latitude: number, radius: number, query: any): Promise<number> {
    return await this.model
      .countDocuments({
        ...query,
        "address.location": {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radius / 6378100],
          },
        },
      }).exec();
  }

  async countAllSalons(query: any): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }

  async getAllSalon(page: number, query: any = {}, limit: number = 10): Promise<{ data: ISalonDocument[]; totalCount: number }> {
    try {
     const salons = await this.model.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('services.service');

const totalCount = await this.model.countDocuments(query);
return { data: salons, totalCount };
    } catch (error: any) {
      console.log("Error fetching salon data", error);
      throw new Error("Could not fetch salons");
    }
  }

  async getSalonService(salonId: string, serviceId: string): Promise<ISalonService | null> {
    const salon = await this.model.findById(salonId).lean().exec()
    return salon?.services.find((s) => s._id.toString() === serviceId) || null;
  }

  async updateSalonOtp(email: string, otp: string, otpExpiry: Date): Promise<ISalonDocument | null> {
    return await this.model.findOneAndUpdate({ email }, { otp, otpExpiry }, { new: true }).lean().exec();
  }

  async verifyOtpAndUpdate(email: string): Promise<ISalonDocument | null> {
    return await this.model.findOneAndUpdate({ email }, { otp: null, otpExpiry: null, verified: true }, { new: true }).lean().exec();
  }

  async updateSalonProfile(updatedData: Partial<ISalon>): Promise<ISalonDocument | null> {
    return await this.model.findOneAndUpdate({ email: updatedData.email }, { ...updatedData }, { new: true }).lean().exec();
  }

  async updateSalonStatus(id: string, isActive: boolean): Promise<ISalonDocument | null> {
    return await this.model.findByIdAndUpdate(id, { is_Active: isActive }, { new: true }).lean().exec();
  }

  async addImagesToSalon(salonId: string, imageData: { id: string; url: string }): Promise<ISalonDocument | null> {
    const salon = await this.findById(salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }
    salon.images.push(imageData);
    await salon.save();
    return salon;
  }

  async deleteSalonImage(salonId: string, imageId: string): Promise<ISalonDocument | null> {
    const salon = await this.findById(salonId);
    if (!salon) {
      return null;
    }
    salon.images = salon.images.filter((img) => img._id.toString() !== imageId);
    await salon.save();
    return salon;
  }

  async addService(
    salonId: string,
    serviceData: { name: string; description: string; service: string; price: number; duration: number; stylists?: {}[] }
  ): Promise<ISalonDocument | null> {
    return await this.model.findByIdAndUpdate(salonId, { $push: { services: serviceData } }, { new: true }).lean().exec();
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
    return await this.model
      .findOneAndUpdate(
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
            "services.$.stylists": serviceData.stylists,
          },
        },
        { new: true }
      )
      .populate("services.service services.stylists")
      .lean()
      .exec();
  }

  async findOrCreateService(serviceData: {
    serviceName: string;
    serviceDescription: string;
    category: string;
    price: number;
  }): Promise<any> {
    let service = await MasterService.findOne({
      serviceName: serviceData.serviceName,
      category: serviceData.category,
    });

    if (!service) {
      service = await MasterService.create(serviceData);
    }

    return service._id;
  }

  async linkServiceToSalon(salonId: string, serviceId: string): Promise<ISalonDocument | null> {
    return await this.model
      .findByIdAndUpdate(salonId, { $addToSet: { serviceIds: serviceId } }, { new: true })
      .populate("serviceIds")
      .exec();
  }

  async totalPages(): Promise<number> {
    const total = await this.countDocuments({});
    return Math.ceil(total / 10);
  }

  async findAllSalons(
    filters: SalonQueryParams,
    page: number,
    itemsPerPage: number
  ): Promise<{ salons: ISalonDocument[]; total: number }> {
    const query: any = {};

    if (filters.search) {
      query.$or = [
        { salonName: { $regex: filters.search, $options: "i" } },
        { "services.name": { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.location) {
      query.$or = [
        { "address.city": { $regex: filters.location, $options: "i" } },
        { "address.areaStreet": { $regex: filters.location, $options: "i" } },
      ];
    }

    if (filters.maxPrice) {
      query["services.price"] = { $lte: filters.maxPrice };
    }

    if (filters.rating && filters.rating.length > 0) {
      query.averageRating = { $in: filters.rating };
    }

    const result = await this.findAll(query, page, itemsPerPage);
    await this.model.populate(result.data, { path: "services.service" });
    return { salons: result.data, total: result.totalCount };
  }

  async removeService(salonId: string, serviceId: string): Promise<ISalonDocument | null> {
    return await this.model
      .findByIdAndUpdate(salonId, { $pull: { services: { _id: serviceId } } }, { new: true })
      .lean()
      .exec();
  }

  async allSalonListForChat(): Promise<Partial<ISalonDocument>[]> {
    return await this.model.find({}, "_id salonName email images").lean().exec();
  }

  async countActiveSalons(): Promise<number> {
      return await this.model.countDocuments({is_Active:true}).exec()
  }

  async countUniqueServices(): Promise<number> {
      const result = await this.model.aggregate([
        {$unwind:"$services"},
        {$group:{_id:"$services"}},
        {$count:"total"}
      ])

      return result[0]?.total || 0
  }

  async countServicesBySalon(salonId: string): Promise<number> {
      const salon = await this.model.findById(salonId).select('services')
      return salon?.services.length || 0
  }
  
}

export default SalonRepository;