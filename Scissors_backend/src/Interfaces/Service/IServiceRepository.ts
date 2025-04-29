import { IService, IServiceDocument } from "./IService";

export interface IServiceRepository {
    findServiceById(serviceId:string):Promise<IServiceDocument | null>
    createService(serviceData:IService):Promise<IServiceDocument>
    getAllServices(page:number,search:any):Promise<{services:IServiceDocument[],totalCount:number}>
    deleteService(id:string):Promise<IServiceDocument | null>
    updateService(data:{id:string,name:string,description:string}):Promise<IServiceDocument | null>
}

