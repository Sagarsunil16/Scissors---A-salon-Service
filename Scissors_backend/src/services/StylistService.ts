import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import { IStylist, IStylistDocument, PaginationOptions } from "../Interfaces/Stylist/IStylist";
import { IStylistRepository } from "../Interfaces/Stylist/IStylistRepository";
import { IStylistService } from "../Interfaces/Stylist/IStylistService";
import CustomError from "../Utils/cutsomError";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import mongoose from "mongoose";

class StylistService implements IStylistService {
  private _stylistRepository: IStylistRepository;
  private _serviceRepository: IServiceRepository;
  private _salonRepository: ISalonRepository;

  constructor(
    stylistRepository: IStylistRepository,
    serviceRepository: IServiceRepository,
    salonRepository: ISalonRepository
  ) {
    this._stylistRepository = stylistRepository;
    this._serviceRepository = serviceRepository;
    this._salonRepository = salonRepository;
  }

  async createStylist(stylistData: IStylist): Promise<IStylistDocument> {
    console.log(stylistData, "stylistData");
    const { name, salon, services } = stylistData;
    if (!name || !salon || !services || !mongoose.Types.ObjectId.isValid(salon.toString())) {
      throw new CustomError(Messages.INVALID_STYLIST_DATA, HttpStatus.BAD_REQUEST);
    }

    const salonExists = await this._salonRepository.getSalonById(salon.toString());
    if (!salonExists) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const serviceChecks = await Promise.all(
      services.map((serviceId) => this._serviceRepository.findServiceById(serviceId.toString()))
    );
    if (serviceChecks.some((service) => !service)) {
      throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return await this._stylistRepository.createStylist(stylistData);
  }

  async findStylist(
    salonId: string,
    options: PaginationOptions,
    searchTerm?: string
  ): Promise<{ stylists: IStylistDocument[]; totalCount: number }> {
    if (!salonId || !mongoose.Types.ObjectId.isValid(salonId)) {
      throw new CustomError(Messages.INVALID_SALON_ID, HttpStatus.BAD_REQUEST);
    }
    if (options.page < 1 || options.limit < 1) {
      throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
    }

    const salon = await this._salonRepository.getSalonById(salonId);
    if (!salon) {
      throw new CustomError(Messages.SALON_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return await this._stylistRepository.findStylists(salonId, options, searchTerm);
  }

  async updateStylist(id: string, updateData: Partial<IStylist>): Promise<IStylistDocument | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(Messages.INVALID_STYLIST_ID, HttpStatus.BAD_REQUEST);
    }

    const existingStylist = await this._stylistRepository.findStylistById(id);
    if (!existingStylist) {
      throw new CustomError(Messages.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (updateData.services) {
      const services = await Promise.all(
        updateData.services.map((serviceId) => this._serviceRepository.findServiceById(serviceId.toString()))
      );
      if (services.some((service) => !service)) {
        throw new CustomError(Messages.SERVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
    }

    const updatedStylist = await this._stylistRepository.updateStylist(id, updateData);
    if (!updatedStylist) {
      throw new CustomError(Messages.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return updatedStylist;
  }

  async findStylistById(id: string): Promise<IStylistDocument | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(Messages.INVALID_STYLIST_ID, HttpStatus.BAD_REQUEST);
    }

    const stylist = await this._stylistRepository.findStylistById(id);
    if (!stylist) {
      throw new CustomError(Messages.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return stylist;
  }

  async deleteStylist(id: string): Promise<boolean> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(Messages.INVALID_STYLIST_ID, HttpStatus.BAD_REQUEST);
    }

    const existingStylist = await this._stylistRepository.findStylistById(id);
    if (!existingStylist) {
      throw new CustomError(Messages.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const result = await this._stylistRepository.deleteStylist(id);
    if (!result) {
      throw new CustomError(Messages.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return result;
  }
}

export default StylistService;