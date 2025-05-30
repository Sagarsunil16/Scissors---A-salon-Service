import { IOffer, IOfferDocument } from "./IOffer";

export interface IOfferService {
    createOffer(offerData: Partial<IOffer>): Promise<IOfferDocument>;
    getSalonOffer(salonId: string): Promise<IOffer[]>;
    updateOfferStatus(offerId:string):Promise<IOfferDocument | null>
    deleteOffer(offerId:string):Promise<IOfferDocument | null>
  }