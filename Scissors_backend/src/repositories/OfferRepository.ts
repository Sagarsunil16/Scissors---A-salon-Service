import { BaseRepository } from "./BaseRepository";
import { IOffer, IOfferDocument } from "../Interfaces/Offers/IOffer";
import IOfferRepository from "../Interfaces/Offers/IOfferRepository";
import Offer from "../models/Offer";
import { ISalonDocument } from "../models/Salon";
import SalonRepository from "./SalonRepository";

const salonRepo = new SalonRepository();

class OfferRepository extends BaseRepository<IOfferDocument> implements IOfferRepository {
  constructor() {
    super(Offer);
  }

  async findOffersBySalonId(salonId: string): Promise<IOfferDocument[]> {
    return await this.model
      .find({ salonId, expiryDate: { $gte: new Date() } })
      .populate("serviceIds", "name")
      .exec();
  }

  async findBySalonId(salonId: string): Promise<ISalonDocument | null> {
    return await salonRepo.findById(salonId);
  }

  async countOffersBySalonId(salonId: string): Promise<number> {
    return await this.countDocuments({
      salonId,
      isActive: true,
      expiryDate: { $gte: new Date() },
    });
  }
  async updateOffer(offerId: string,updateData:Partial<IOffer>): Promise<IOfferDocument | null> {
      return await this.updateById(offerId,updateData)
  }
  async deleteOffer(offerId: string): Promise<IOfferDocument | null> {
      return await this.deleteById(offerId)
  }
}

export default OfferRepository;