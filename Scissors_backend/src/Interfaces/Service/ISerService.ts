import { CreateServiceDto, ServiceDto, UpdateServiceDto } from "../../dto/service.dto";
import { IServiceDocument } from "./IService";

export interface ISalonMenuService {
  findServiceById(serviceId: string): Promise<ServiceDto | null>;
  createService(serviceData: CreateServiceDto): Promise<ServiceDto>;
  getAllServices(page: number, search: string): Promise<{ services: ServiceDto[]; totalCount: number,totalPages: number;
    currentPage: number; }>;
  updateService(data: UpdateServiceDto): Promise<ServiceDto | null>;
  deleteService(id: string): Promise<String | null>;
}