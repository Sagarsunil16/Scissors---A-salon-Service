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
    return await this.model.findById(serviceId).lean().exec();
  }

  async getAllServices(
    page: number,
    query: any = {},
    limit: number = 6
  ): Promise<{ services: IServiceDocument[]; totalCount: number   }> {
    const skip = (page - 1) * limit;
    const [services, totalCount] = await Promise.all([
      this.model.find(query).skip(skip).limit(limit).lean().exec(),
      this.model.countDocuments(query).exec(),
    ]);
    return { services, totalCount };
  }

  async deleteService(id: string): Promise<IServiceDocument | null> {
    return await this.model.findByIdAndDelete(id).lean().exec();
  }

  async updateService(data: { id: string; name: string; description: string }): Promise<IServiceDocument | null> {
    const updateData: Partial<IService> = { name: data.name, description: data.description };
    return await this.model.findByIdAndUpdate(data.id, updateData, { new: true }).lean().exec()
  }
}

export default ServiceRepository;