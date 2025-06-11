import { HttpStatus } from "../constants/HttpStatus";
import { IOffer, IOfferDocument } from "../Interfaces/Offers/IOffer";
import IOfferRepository from "../Interfaces/Offers/IOfferRepository";
import { IOfferService } from "../Interfaces/Offers/IOfferService";
import CustomError from "../Utils/cutsomError";
import { Messages } from "../constants/Messages";

class OfferService implements IOfferService {
  private _repository: IOfferRepository;

  constructor(repository: IOfferRepository) {
    this._repository = repository;
  }

  async createOffer(userId: string | undefined, offerData: Partial<IOffer>): Promise<IOfferDocument> {
    if (!userId) {
      throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const { salonId, title, description, discount, serviceIds, expiryDate } = offerData;
    if (!salonId || !title || discount == null || !serviceIds || !expiryDate) {
      throw new CustomError(Messages.INVALID_OFFER_DATA, HttpStatus.BAD_REQUEST);
    }

    const salon = await this._repository.findBySalonId(salonId.toString());
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (new Date(expiryDate) <= new Date()) {
      throw new CustomError(Messages.INVALID_EXPIRY_DATE, HttpStatus.BAD_REQUEST);
    }

    if (serviceIds && serviceIds.length > 0) {
      const validServiceIds = salon.services.map((s: any) => s.service.toString());
      const invalidServices = serviceIds.filter((id) => !validServiceIds.includes(id.toString()));
      if (invalidServices.length > 0) {
        throw new CustomError(Messages.INVALID_SERVICE_IDS, HttpStatus.BAD_REQUEST);
      }
    }

    return await this._repository.create(offerData);
  }

  async getSalonOffer(salonId: string): Promise<IOffer[]> {
    if (!salonId) {
      throw new CustomError(Messages.SALON_ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const salon = await this._repository.findBySalonId(salonId);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return await this._repository.findOffersBySalonId(salonId);
  }

  async updateOfferStatus(offerId: string): Promise<IOfferDocument> {
    if (!offerId) {
      throw new CustomError(Messages.INVALID_OFFER_ID, HttpStatus.BAD_REQUEST);
    }

    const offer = await this._repository.findById(offerId);
    if (!offer) {
      throw new CustomError(Messages.OFFER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updateData = { isActive: !offer.isActive };
    const result = await this._repository.updateOffer(offerId, updateData);
    if (!result) {
      throw new CustomError(Messages.OFFER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return result;
  }

  async deleteOffer(offerId: string): Promise<IOfferDocument | null> {
    if (!offerId) {
      throw new CustomError(Messages.INVALID_OFFER_ID, HttpStatus.BAD_REQUEST);
    }

    const offer = await this._repository.findById(offerId);
    if (!offer) {
      throw new CustomError(Messages.OFFER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return await this._repository.deleteOffer(offerId);
  }
}

export default OfferService;