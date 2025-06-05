import { IServiceDocument } from "./IService";

export interface ISalonMenuService {
  findServiceById(serviceId: string): Promise<IServiceDocument | null>;
  createService(serviceData: any): Promise<IServiceDocument>;
  getAllServices(page: number, search: string): Promise<{ services: IServiceDocument[]; totalCount: number }>;
  updateService(data: any): Promise<IServiceDocument | null>;
  deleteService(id: string): Promise<IServiceDocument | null>;
}