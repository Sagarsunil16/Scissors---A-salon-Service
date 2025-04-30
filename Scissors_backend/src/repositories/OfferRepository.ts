import { BaseRepository } from "./BaseRepository";
import { IOfferDocument } from "../Interfaces/Offers/IOffer";
import IOfferRepository from "../Interfaces/Offers/IOfferRepository";
import Offer from "../models/Offer";
import { ISalonDocument } from "../models/Salon";
import SalonRepository from "./SalonRepository";

const salonRepo = new SalonRepository();

class OfferRepository extends BaseRepository<IOfferDocument> implements IOfferRepository {
  constructor() {
    super(Offer);
  }

  async findActiveOffersBySalonId(salonId: string): Promise<IOfferDocument[]> {
    return await this.model
      .find({ salonId, isActive: true, expiryDate: { $gte: new Date() } })
      .populate("serviceIds", "name")
      .exec();
  }

  async findBySalonId(salonId: string): Promise<ISalonDocument | null> {
    return await salonRepo.findById(salonId);
  }

  async countActiveOffersBySalonId(salonId: string): Promise<number> {
    return await this.countDocuments({
      salonId,
      isActive: true,
      expiryDate: { $gte: new Date() },
    });
  }
}

export default OfferRepository;