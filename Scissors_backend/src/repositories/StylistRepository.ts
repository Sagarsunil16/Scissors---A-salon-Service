import Stylist from "../models/Stylist";
import { IStylistRepository } from "../Interfaces/Stylist/IStylistRepository";
import { IStylist, IStylistDocument, PaginationOptions } from "../Interfaces/Stylist/IStylist";

class StylistRepositry implements IStylistRepository{
    async createStylist(stylistData: IStylist): Promise<IStylistDocument> {
        return await Stylist.create(stylistData)   
    }
    async findStylistById(id: string): Promise<IStylistDocument | null> {
        return await Stylist.findById(id)
    }
    async findStylists(salonId: string, { page, limit }: PaginationOptions, searchTerm?: string): Promise<{ stylists: IStylistDocument[]; totalCount: number; }> {
        const query:any = {salon:salonId}
        if(searchTerm){
            query.$or = [
                {name:{$regex:searchTerm,$options:'i'}},
                {email:{$regex:searchTerm,$options:'i'}},
                {phone:{$regex:searchTerm,$options:'i'}}
            ]
        }

        const [stylists,totalCount] = await Promise.all([
            Stylist.find(query).populate('services').skip((page-1)*limit).limit(limit).sort({name:1}).exec(),
            Stylist.countDocuments(query).exec()
        ]);
        return {stylists,totalCount}
    }
    updateStylist(id: string, stylistData: Partial<IStylist>, options?: { populateServices?: boolean; }): Promise<IStylistDocument | null> {
        const query = Stylist.findByIdAndUpdate(id,stylistData,{
            new:true,
            runValidators:true
        })
        if(options?.populateServices){
            query.populate('services')
        }

        return query.exec()
    }
}

export default StylistRepositry 