import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { IStylistService } from "../Interfaces/Stylist/IStylistService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import mongoose from "mongoose";

class StylistController {
  private _stylistService: IStylistService;

  constructor(stylistService: IStylistService) {
    this._stylistService = stylistService;
  }

  async createStylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, salon, services } = req.body;
      console.log(req.body)
      if (!name || !salon || !services || !mongoose.Types.ObjectId.isValid(salon)) {
        throw new CustomError(Messages.INVALID_STYLIST_DATA, HttpStatus.BAD_REQUEST);
      }

      const result = await this._stylistService.createStylist(req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_CREATED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.CREATE_STYLIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getStylistbySalonId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, page = "1", limit = "10", search = "" } = req.query;
      console.log(req.query)
      if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
        throw new CustomError(Messages.INVALID_SALON_ID, HttpStatus.BAD_REQUEST);
      }

      const pageNumber = parseInt(page as string, 10) || 1;
      const limitNumber = parseInt(limit as string, 10) || 10;
      if (pageNumber < 1 || limitNumber < 1) {
        throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
      }

      const options = {
        page: pageNumber,
        limit: limitNumber,
      };

      const result = await this._stylistService.findStylist(id as string, options, search as string);
      res.status(HttpStatus.OK).json({
        message: Messages.STYLISTS_FETCHED_BY_SALON,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_STYLISTS_BY_SALON_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async updateStylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.INVALID_STYLIST_ID, HttpStatus.BAD_REQUEST);
      }

      const updatedStylist = await this._stylistService.updateStylist(id, req.body);
      if (!updatedStylist) {
        throw new CustomError(Messages.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_UPDATED,
        success: true,
        data: updatedStylist,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.UPDATE_STYLIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getStylistById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.INVALID_STYLIST_ID, HttpStatus.BAD_REQUEST);
      }

      const result = await this._stylistService.findStylistById(id);
      if (!result) {
        throw new CustomError(Messages.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_FETCHED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_STYLIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async deleteStylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.INVALID_STYLIST_ID, HttpStatus.BAD_REQUEST);
      }

      const result = await this._stylistService.deleteStylist(id);
      if (!result) {
        throw new CustomError(Messages.STYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      res.status(HttpStatus.OK).json({
        message: Messages.STYLIST_DELETED,
        result,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.DELETE_STYLIST_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default StylistController;