import { ISalonMenuService } from "../Interfaces/Service/ISerService";
import { IServiceDocument } from "../Interfaces/Service/IService";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import CustomError from "../Utils/cutsomError";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import mongoose from "mongoose";

class SalonMenuService implements ISalonMenuService {
  private _repository: IServiceRepository;

  constructor(repository: IServiceRepository) {
    this._repository = repository;
  }

  async findServiceById(serviceId: string): Promise<IServiceDocument | null> {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      throw new CustomError(Messages.INVALID_SERVICE_ID, HttpStatus.BAD_REQUEST);
    }
    const service = await this._repository.findServiceById(serviceId);
    if (!service) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return service;
  }

  async createService(serviceData: any): Promise<IServiceDocument> {
    const { name, description } = serviceData;
    if (!name || !description) {
      throw new CustomError(Messages.INVALID_SERVICE_DATA, HttpStatus.BAD_REQUEST);
    }
    return await this._repository.createService({
      name,
      description,
    });
  }

  async getAllServices(page: number, search: string): Promise<{ services: IServiceDocument[]; totalCount: number }> {
    if (isNaN(page) || page < 1) {
      throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
    }
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const result = await this._repository.getAllServices(page, query);
    if (!result || result.services.length === 0) {
      throw new CustomError(Messages.NO_SERVICES_FOUND, HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async updateService(data: any): Promise<IServiceDocument | null> {
    const { id, name, description } = data;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(Messages.INVALID_SERVICE_ID, HttpStatus.BAD_REQUEST);
    }
    if (!name || !description) {
      throw new CustomError(Messages.INVALID_SERVICE_DATA, HttpStatus.BAD_REQUEST);
    }
    
    const result = await this._repository.updateService({
      id,
      name,
      description,
    });
    if (!result) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async deleteService(id: string): Promise<IServiceDocument | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(Messages.INVALID_SERVICE_ID, HttpStatus.BAD_REQUEST);
    }
    const result = await this._repository.deleteService(id);
    if (!result) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return result;
  }
}

export default SalonMenuService;