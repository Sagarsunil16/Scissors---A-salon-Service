import { ISalonDocument } from "../../models/Salon"
import { IOffer, IOfferDocument } from "./IOffer"

interface IOfferRepository {
    create(data:Partial<IOfferDocument>):Promise<IOfferDocument>
    findOffersBySalonId(salonId:string):Promise<IOffer[]>
    findById(id:string):Promise<IOfferDocument | null>
    findBySalonId(salonId:string):Promise<ISalonDocument | null>
    updateOffer(offerId:string,updateData:Partial<IOffer>):Promise<IOfferDocument | null>
    countOffersBySalonId(salonId:string):Promise<number>
    deleteOffer(offerId:string):Promise<IOfferDocument | null>
}


export default IOfferRepository