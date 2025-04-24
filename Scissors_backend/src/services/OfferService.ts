import { IOffer, IOfferDocument } from "../Interfaces/Offers/IOffer"
import IOfferRepository from "../Interfaces/Offers/IOfferRepository"
import CustomError from "../Utils/cutsomError"

class OfferService{
    private repository:IOfferRepository
    constructor(repository:IOfferRepository){
        this.repository = repository
    }
    async createOffer(offerData:Partial<IOffer>):Promise<IOfferDocument>{
        const salon =  await this.repository.findBySalonId(offerData.salonId!.toString())
        if(!salon){
            throw new CustomError("Salon not Found",404)
        }

        const activeOffersCount =  await this.repository.countActiveOffersBySalonId(offerData.salonId!.toString())
        if(activeOffersCount >= 5){
            throw new CustomError("Maximum active offers reaached (5)",400)
        }

        if(new Date(offerData.expiryDate as Date) <= new Date()){
            throw new CustomError("Expiry date must be in the future",400)
        }

        if(offerData.serviceIds && offerData.serviceIds.length>0){
            const validServiceIds = salon.services.map((s:any)=>s.service.toString())
            const invalidServices = offerData.serviceIds.filter((id)=>!validServiceIds.includes(id.toString()))
            if(invalidServices.length>0){
                throw new CustomError("Invalid service Ids provided",400)
            }
        }
        return await this.repository.create(offerData)
    }

    async getSalonOffer(salonId:string):Promise<IOffer[]>{
        const salon =  await this.repository.findBySalonId(salonId)
        if(!salon){
            throw new CustomError("Salon not found",404)
        }
        return await this.repository.findActiveOffersBySalonId(salonId)
    }
}

export default OfferService 