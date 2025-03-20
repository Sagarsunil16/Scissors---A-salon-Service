import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import { IStylist, IStylistDocument, PaginationOptions } from "../Interfaces/Stylist/IStylist";
import { IStylistRepository } from "../Interfaces/Stylist/IStylistRepository";
import CustomError
 from "../Utils/cutsomError";

class StylistService{
    private stylistRepository:IStylistRepository
    private serviceRepository:IServiceRepository
    private salonRepository:ISalonRepository
    constructor(stylistRepository:IStylistRepository,serviceRepository:IServiceRepository,salonRepository:ISalonRepository){
        this.stylistRepository = stylistRepository,
        this.serviceRepository = serviceRepository,
        this.salonRepository = salonRepository
    }

    async createStylist(stylistData:IStylist):Promise<IStylistDocument>{
        const salon = await this.salonRepository.getSalonById(stylistData.salon.toString())
        if(!salon){
            throw new CustomError("Salon not found",404)
        }
        const service =  await Promise.all(
            stylistData.services.map((serviceId)=>this.serviceRepository.findServiceById(serviceId.toString()))
        );

        if(service.some(service=>!service)){
            throw new CustomError("One or more services are not found. Please check the service details.", 404)
        }
        return this.stylistRepository.createStylist(stylistData)
    }


    async findStylist(salonId:string,options:PaginationOptions,searchTerm?:string):Promise<{ stylists: IStylistDocument[]; totalCount:number}>{
        if (!salonId) throw new Error('Salon ID is required');
        if (options.page < 1) throw new Error('Invalid page number');
        if (options.limit < 1) throw new Error('Invalid limit value');
        const salon  = this.salonRepository.getSalonById(salonId)
        if(!salon){
            throw new CustomError("No Salon Found. Please check the salon ID.", 404);
        }
        return this.stylistRepository.findStylists(salonId,options,searchTerm)
    }

    async updateStylist(id:string,updateData:Partial<IStylist>):Promise<IStylistDocument | null>{
        const existingStylist =  await this.stylistRepository.findStylistById(id)
        if(!existingStylist){
            throw new CustomError("Stylist not found. Please check the stylist ID.", 404);
        }
        if(updateData.services){
            const services = await Promise.all(
                updateData.services.map((serviceId)=> this.serviceRepository.findServiceById(serviceId.toString()))
            );
            if(services.some(service=>!service)){
                throw new CustomError("One or more services are not found. Please check the service details.", 404);
            }
        }

        return this.stylistRepository.updateStylist(id, updateData);
    }

    async findStylistById(id:string):Promise<IStylistDocument | null>{
        if(!id){
            throw new CustomError("ID is required to fetch stylist details.", 400);
        }
        const stylist = await this.stylistRepository.findStylistById(id);
        if (!stylist) {
          throw new CustomError("Stylist not found. Please check the stylist ID.", 404);
        }
        return stylist;
    }

    async deleteStylist(id:string):Promise<boolean>{
        if(!id){
            throw new CustomError("ID is required to delete stylist.", 400);
        }
        const existingStylist = this.findStylistById(id)
        if(!existingStylist){
            throw new CustomError("Stylist not found. Please check the stylist ID.", 404);
        }
        return this.stylistRepository.deleteStylist(id)
    }
}


export default StylistService