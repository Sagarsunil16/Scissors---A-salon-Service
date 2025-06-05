import { IOffer, IOfferDocument } from "./IOffer";

export interface IOfferService {
  createOffer(userId: string | undefined, offerData: Partial<IOffer>): Promise<IOfferDocument>;
  getSalonOffer(salonId: string): Promise<IOffer[]>;
  updateOfferStatus(offerId: string): Promise<IOfferDocument>;
  deleteOffer(offerId: string): Promise<IOfferDocument | null>;
}