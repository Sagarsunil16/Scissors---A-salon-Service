import { IServiceDocument } from "./IService";

export interface ISalonMenuService {
    findServiceById(serviceId: string): Promise<IServiceDocument | null>;
    createService(serviceData: { name: string; description: string }): Promise<IServiceDocument>;
    getAllServices(page: number, search: string): Promise<{ services: IServiceDocument[]; totalCount: number }>;
    updateService(data: { id: string; name: string; description: string }): Promise<IServiceDocument | null>;
    deleteService(id: string): Promise<IServiceDocument | null>;
  }