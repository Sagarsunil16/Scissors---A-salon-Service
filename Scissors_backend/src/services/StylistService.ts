import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import { IStylist, IStylistDocument, PaginationOptions } from "../Interfaces/Stylist/IStylist";
import { IStylistRepository } from "../Interfaces/Stylist/IStylistRepository";

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
            throw new Error("Salon not found")
        }
        const service =  await Promise.all(
            stylistData.services.map((serviceId)=>this.serviceRepository.findServiceById(serviceId.toString()))
        );

        if(service.some(service=>!service)){
            throw new Error("One or more services are not found.")
        }
        return this.stylistRepository.createStylist(stylistData)
    }


    async findStylist(salonId:string,options:PaginationOptions,searchTerm?:string):Promise<{ stylists: IStylistDocument[]; totalCount:number}>{
        if (!salonId) throw new Error('Salon ID is required');
        if (options.page < 1) throw new Error('Invalid page number');
        if (options.limit < 1) throw new Error('Invalid limit value');
        const salon  = this.salonRepository.getSalonById(salonId)
        if(!salon){
            throw new Error("No Salon Found")
        }
        return this.stylistRepository.findStylists(salonId,options,searchTerm)
    }

    async updateStylist(id:string,updateData:Partial<IStylist>):Promise<IStylistDocument | null>{
        const existingStylist =  await this.stylistRepository.findStylistById(id)
        if(!existingStylist){
            throw new Error("Stylist not Found")
        }
        if(updateData.services){
            const services = await Promise.all(
                updateData.services.map((serviceId)=> this.serviceRepository.findServiceById(serviceId.toString()))
            );
            if(services.some(service=>!service)){
                throw new Error("One or more services not found")
            }
        }

        return this.stylistRepository.updateStylist(id, updateData);
    }
}


export default StylistService