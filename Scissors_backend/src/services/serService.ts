import { IService, IServiceDocument } from "../Interfaces/Service/IService";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import CustomError from "../Utils/cutsomError";

class SerService{
    private repository :IServiceRepository
    constructor(repository:IServiceRepository){
        this.repository = repository
    }

    async findServiceById(serviceId:string):Promise<IServiceDocument | null>{
        if(!serviceId){
            throw new CustomError("Service ID is required.", 400);
        }
        const service = this.repository.findServiceById(serviceId)
        if(!service){
            throw new CustomError("Service not found. Please check the ID and try again.", 404);
        }

        return service
    }

    async createService(serviceData:{name:string,description:string}):Promise<IServiceDocument>{
        const {name,description} = serviceData
        if(!name || !description){
            throw new CustomError("Both name and description are required to create a service.", 400);
        }
        const result = await this.repository.createService(serviceData)
        return result
    }

    async getAllServices(page:number):Promise<{services:IServiceDocument[],totalCount:number}>{
            const result = this.repository.getAllServices(page)
            if(!result){
                throw new CustomError("No services found. Please try again later.", 404);
            }
            return result
        }
    
    async updateService(data:{id:string,name:string,description:string}):Promise<IServiceDocument | null>{
        const {id,name,description} = data
        if(!id){
            throw new CustomError("Service ID is required to update.", 400);
        }
        if(!name || !description){
            throw new CustomError("Both name and description are required to update the service.", 400);
        }
        const result  =  await this.repository.updateService(data)
        if (!result) {
            throw new CustomError("Service not found or update failed.", 404);
        }
        return result
    }

    async deleteService(id:string):Promise<IServiceDocument | null>{
         if(!id){
            throw new CustomError("Service ID is required to delete a service.", 400);
        }
        const result = this.repository.deleteService(id)
        if (!result) {
            throw new CustomError("Service not found or deletion failed.", 404);
        }
        return result
    }
}

export default SerService