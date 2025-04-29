import { IService, IServiceDocument } from "../Interfaces/Service/IService";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import Service from "../models/Service";

class ServiceRepository implements IServiceRepository{

    async findServiceById(serviceId: string): Promise<IServiceDocument | null> {
        return Service.findById(serviceId)
    }
    async createService(serviceData: IService): Promise<IServiceDocument> {
        return await Service.create(serviceData)
    }
    async getAllServices(page:number,query?:any): Promise<{services:IServiceDocument[],totalCount:number}> {
        const skip =  (page-1)  * 10
        const services = await Service.find(query).skip(skip).limit(10)
        const totalCount = await Service.countDocuments(query)
        return {services,totalCount}
    }
    async deleteService(id:string):Promise<IServiceDocument | null>{
       return await Service.findByIdAndDelete(id)
    }
    async updateService(data: { id: string; name: string; description: string; }): Promise<IServiceDocument | null> {
        return await Service.findByIdAndUpdate(data.id,{name:data.name,description:data.description},{new:true})
    }
}

export default ServiceRepository