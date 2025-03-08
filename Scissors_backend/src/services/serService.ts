import { IService, IServiceDocument } from "../Interfaces/Service/IService";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";

class SerService{
    private repository :IServiceRepository
    constructor(repository:IServiceRepository){
        this.repository = repository
    }

    async findServiceById(serviceId:string):Promise<IServiceDocument | null>{
        if(!serviceId){
            throw new Error("Id not Found")
        }
        const service = this.repository.findServiceById(serviceId)
        if(!service){
            throw new Error("Service not Found")
        }

        return service
    }

    async createService(serviceData:{name:string,description:string}):Promise<IServiceDocument>{
        const {name,description} = serviceData
        if(!name || !description){
            throw new Error("Name and Description is required!")
        }
        const result = await this.repository.createService(serviceData)
        return result
    }

    async getAllServices(page:number):Promise<{services:IServiceDocument[],totalCount:number}>{
            const result = this.repository.getAllServices(page)
            if(!result){
                throw new Error("No Data Found")
            }
            return result
        }
    
    async updateService(data:{id:string,name:string,description:string}):Promise<IServiceDocument | null>{
        const {id,name,description} = data
        if(!id){
            throw new Error("Id not found!")
        }
        if(!name || !description){
            throw new Error("Name and Description is needed")
        }
        const result  =  await this.repository.updateService(data)
        return result
    }

    async deleteService(id:string):Promise<IServiceDocument | null>{
         if(!id){
            throw new Error("Id Not found");
        }
        const result = this.repository.deleteService(id)
        return result
    }
}

export default SerService