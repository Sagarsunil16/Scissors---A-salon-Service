import { BaseRepository } from "./BaseRepository";
import { IService, IServiceDocument } from "../Interfaces/Service/IService";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import Service from "../models/Service";

class ServiceRepository extends BaseRepository<IServiceDocument> implements IServiceRepository {
  constructor() {
    super(Service);
  }
  async createService(serviceData: IService): Promise<IServiceDocument> {
    return await this.create(serviceData);
  }

  async findServiceById(serviceId: string): Promise<IServiceDocument | null> {
    return await this.findById(serviceId);
  }

  async getAllServices(
    page: number,
    query: any = {},
    limit: number = 10
  ): Promise<{ services: IServiceDocument[]; totalCount: number }> {
    const result = await this.findAll(query, page, limit);
    return { services: result.data, totalCount: result.totalCount };
  }

  async deleteService(id: string): Promise<IServiceDocument | null> {
    return await this.deleteById(id);
  }

  async updateService(data: { id: string; name: string; description: string }): Promise<IServiceDocument | null> {
    const updateData: Partial<IService> = { name: data.name, description: data.description };
    return await this.updateById(data.id, updateData, { new: true });
  }
}

export default ServiceRepository;