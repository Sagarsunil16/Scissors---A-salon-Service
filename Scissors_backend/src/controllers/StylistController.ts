import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { IStylistService } from "../Interfaces/Stylist/IStylistService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

class StylistController {
  private _stylistService: IStylistService;

  constructor(stylistService: IStylistService) {
    this._stylistService = stylistService;
  }

  async createStylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body);
      const result = await this._stylistService.createStylist(req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_CREATED,
        result,
      });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.CREATE_STYLIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getStylistbySalonId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.query);
      const { id, page = "1", limit = "10", search = "" } = req.query;
      const pageNumber = parseInt(page as string, 10) || 1;
      const limitNumber = parseInt(limit as string, 10) || 10;
      const options = {
        page: pageNumber,
        limit: limitNumber,
      };

      const result = await this._stylistService.findStylist(id as string, options, search as string);
      res.status(HttpStatus.OK).json({
        message: Messages.STYLISTS_FETCHED_BY_SALON,
        result,
      });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.FETCH_STYLISTS_BY_SALON_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async updateStylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const updatedStylist = await this._stylistService.updateStylist(id, req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_UPDATED,
        success: true,
        data: updatedStylist,
      });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.UPDATE_STYLIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getStylistById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this._stylistService.findStylistById(id);
      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_FETCHED,
        result,
      });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.FETCH_STYLIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async deleteStylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this._stylistService.deleteStylist(id);
      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_DELETED,
        result,
      });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.DELETE_STYLIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default StylistController;