import { ISalonMenuService } from "../Interfaces/Service/ISerService";
import { IServiceDocument } from "../Interfaces/Service/IService";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import CustomError from "../Utils/cutsomError";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import mongoose from "mongoose";
import { CreateServiceDto, ServiceDto, UpdateServiceDto } from "../dto/service.dto";
import { plainToClass } from "class-transformer";
import Service from "../models/Service";
import { validate } from "class-validator";

class SalonMenuService implements ISalonMenuService {
  private _repository: IServiceRepository;

  constructor(repository: IServiceRepository) {
    this._repository = repository;
  }

  async findServiceById(serviceId: string): Promise<ServiceDto | null> {
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      throw new CustomError(Messages.INVALID_SERVICE_ID, HttpStatus.BAD_REQUEST);
    }
    const service = await this._repository.findServiceById(serviceId);
    if (!service) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return plainToClass(ServiceDto,{
      _id:(service._id as mongoose.Types.ObjectId).toString(),
      name: service.name,
      description: service.description,
    });
  }

  async createService(serviceData: CreateServiceDto): Promise<ServiceDto> {
    const createServiceDto = plainToClass(CreateServiceDto,serviceData)
    const errors = await validate(createServiceDto);
    if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_SERVICE_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }
    
    let result = await this._repository.createService({
      name: createServiceDto.name,
      description: createServiceDto.description,
    });

    result.toObject()
   
    return plainToClass(ServiceDto,{
      _id: (result._id as mongoose.Types.ObjectId).toString(),
      name: result.name,
      description: result.description,
    })
  }

  async getAllServices(page: number, search: string): Promise<{ services: ServiceDto[]; totalCount: number ,totalPages: number;
    currentPage: number;}> {
    if (isNaN(page) || page < 1) {
      throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
    }
    const limit = 6;
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const result = await this._repository.getAllServices(page, query, limit);
    if (!result || result.services.length === 0) {
      throw new CustomError(Messages.NO_SERVICES_FOUND, HttpStatus.NOT_FOUND);
    }
    return {
      services: result.services.map((service) =>
        plainToClass(ServiceDto, {
          _id: (service._id as mongoose.Types.ObjectId).toString(),
          name: service.name,
          description: service.description,
        })
      ),
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / limit),
      currentPage: page,
    };
  }

  async updateService(data: UpdateServiceDto): Promise<ServiceDto | null> {
    const updateServiceDto = plainToClass(UpdateServiceDto, data);
    const errors = await validate(updateServiceDto);
    if (errors.length > 0) {
      throw new CustomError(
        Messages.INVALID_SERVICE_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '),
        HttpStatus.BAD_REQUEST
      );
    }
    const service = await this._repository.findServiceById(updateServiceDto.id);
    if (!service) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    const result = await this._repository.updateService({
      id: updateServiceDto.id,
      name: updateServiceDto.name,
      description: updateServiceDto.description,
    });
    if (!result) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  return plainToClass(ServiceDto, {
      id: (result._id as mongoose.Types.ObjectId).toString(),
      name: result.name,
      description: result.description,
    });
  }

  async deleteService(id: string): Promise<string> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(Messages.INVALID_SERVICE_ID, HttpStatus.BAD_REQUEST);
    }
   const service = await this._repository.findServiceById(id);
    if (!service) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
   await this._repository.deleteService(id);
    return Messages.SERVICE_DELETED;
  }
}

export default SalonMenuService;