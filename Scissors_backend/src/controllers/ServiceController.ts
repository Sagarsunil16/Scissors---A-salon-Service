import { Request, Response, NextFunction } from "express";
import { ISalonMenuService } from "../Interfaces/Service/ISerService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

class ServiceController {
  private _salonMenuService: ISalonMenuService;

  constructor(serService: ISalonMenuService) {
    this._salonMenuService = serService;
  }

  async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body,"we entered")
      const result = await this._salonMenuService.createService(req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_CREATED,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", search = "" } = req.query;
      const pageNumber = parseInt(page as string, 10) || 1;
      const result = await this._salonMenuService.getAllServices(pageNumber, search as string);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICES_FETCHED,
          services: result.services,
          totalPages: Math.ceil(result.totalCount / 10),
          pagination: {
          totalItems: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this._salonMenuService.updateService(req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_UPDATED,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.query.id as string;
      const result = await this._salonMenuService.deleteService(id);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_DELETED,
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ServiceController;