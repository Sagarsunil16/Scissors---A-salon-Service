import { IOffer, IOfferDocument } from "../Interfaces/Offers/IOffer";
import IOfferRepository from "../Interfaces/Offers/IOfferRepository";
import Offer from "../models/Offer";
import Salon, { ISalonDocument } from "../models/Salon";
import { BaseRepository } from "./BaseRepository";

class OfferRepository extends BaseRepository<IOfferDocument> implements IOfferRepository{
    constructor(){
        super(Offer)
    }
    async findActiveOffersBySalonId(salonId: string): Promise<IOffer[]> {
        return await Offer.find({salonId,isActive:true,expiryDate:{$gte:new Date()}}).populate("serviceIds","name").lean()
    }

    async findBySalonId(salonId: string): Promise<ISalonDocument | null> {
        return await Salon.findById(salonId)

    }

    async countActiveOffersBySalonId(salonId: string): Promise<number> {
        return await Offer.countDocuments({salonId,isActive:true,expiryDate:{$gte: new Date()}})
    }
}

export default OfferRepository