import { Request, Response, NextFunction } from "express";
import CustomError from "../Utils/cutsomError";
import { ISalonMenuService } from "../Interfaces/Service/ISerService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import mongoose from "mongoose";

class ServiceController {
  private _serService: ISalonMenuService;

  constructor(serService: ISalonMenuService) {
    this._serService = serService;
  }

  async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, price, duration } = req.body;
      if (!name || !price || !duration) {
        throw new CustomError(Messages.INVALID_SERVICE_DATA, HttpStatus.BAD_REQUEST);
      }

      const result = await this._serService.createService(req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_CREATED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.CREATE_SERVICE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", search = "" } = req.query;
      const pageNumber = parseInt(page as string, 10) || 1;

      if (pageNumber < 1) {
        throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
      }

      const result = await this._serService.getAllServices(pageNumber, search as string);
      if (!result || result.services.length === 0) {
        throw new CustomError(Messages.NO_SERVICES_FOUND, HttpStatus.NOT_FOUND);
      }

      const totalServicePages = Math.ceil(result.totalCount / 10);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICES_FETCHED,
        services: result.services,
        totalPages: totalServicePages,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_SERVICES_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.INVALID_SERVICE_ID, HttpStatus.BAD_REQUEST);
      }

      const result = await this._serService.updateService(req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_UPDATED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.UPDATE_SERVICE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.query.id as string;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.INVALID_SERVICE_ID, HttpStatus.BAD_REQUEST);
      }

      const result = await this._serService.deleteService(id);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_DELETED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.DELETE_SERVICE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default ServiceController;