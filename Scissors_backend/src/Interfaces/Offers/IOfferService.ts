import { IOffer, IOfferDocument } from "./IOffer";

export interface IOfferService {
    createOffer(offerData: Partial<IOffer>): Promise<IOfferDocument>;
    getSalonOffer(salonId: string): Promise<IOffer[]>;
  }