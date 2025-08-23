import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import mongoose from "mongoose";
import logger from "../Utils/logger";

class SalonController {
  private _salonService: ISalonService;

  constructor(salonService: ISalonService) {
    this._salonService = salonService;
  }

  async createSalon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { salonName, email, phone, address, category} = req.body;
      
      if (!salonName || !email || !phone || !address || !category) {
        throw new CustomError(Messages.INVALID_SALON_DATA, HttpStatus.BAD_REQUEST);
      }

      const newSalon = await this._salonService.createSalon(req.body);
      res.status(HttpStatus.CREATED).json({
        message: Messages.SALON_REGISTERED,
        salon: {
          _id: newSalon._id,
          salonName: newSalon.salonName,
          email: newSalon.email,
          phone: newSalon.phone,
          address: newSalon.address,
          category: newSalon.category,
          openingTime: newSalon.openingTime,
          closingTime: newSalon.closingTime,
          rating: newSalon.rating,
        },
      });
    } catch (error:any) {
       logger.error(`loginSalon Error: ${error}`);
      next(error);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new CustomError(Messages.INVALID_EMAIL, HttpStatus.BAD_REQUEST);
      }

      const message = await this._salonService.sendOtp(email);
      res.status(HttpStatus.OK).json({ message });
    } catch (error:any) {
       next(error);
    }
  }

  async verifyOtpAndUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        throw new CustomError(Messages.INVALID_OTP, HttpStatus.BAD_REQUEST);
      }

      const message = await this._salonService.verifyOtp(email, otp);
      res.status(HttpStatus.OK).json({ message });
    } catch (error:any) {
      next(error);
    }
  }

  async loginSalon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body,"asdasda")
      const { email, password } = req.body;
      if (!email || !password) {
        throw new CustomError(Messages.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);
      }

      const result = await this._salonService.loginSalon(req.body);
      console.log(result,"login result")
      res
        .cookie("authToken", result?.accessToken, {
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
        })
        .cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
        })
        .status(HttpStatus.OK)
        .json({ message: Messages.LOGIN_SUCCESS, details: result?.salon });
    } catch (error:any) {
      next(error);
    }
  }

  async signOutSalon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this._salonService.signOut(refreshToken);
      res
        .clearCookie("authToken", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" })
        .clearCookie("refreshToken", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" })
        .status(HttpStatus.OK)
        .json({ message: Messages.LOGGED_OUT });
    } catch (error:any) {
       next(error);
    }
  }

  async getAllSalons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, location, maxPrice, ratings, offers, page = "1", itemsPerPage = "6" } = req.query;
      const pageNumber = parseInt(page as string, 10) || 1;
      const itemsPerPageNumber = parseInt(itemsPerPage as string, 10) || 6;

      if (pageNumber < 1 || itemsPerPageNumber < 1) {
        throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
      }

      const { salons, total, totalPages } = await this._salonService.getFilteredSalons(
        {
          search: search?.toString(),
          location: location?.toString(),
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          ratings: ratings ? (ratings as string).split(",").map(Number).filter(n => n >= 1 && n <= 5) : [],
          offers: offers?.toString(),
        },
        pageNumber,
        itemsPerPageNumber
      );

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          salons,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalItems: total,
            itemsPerPage: itemsPerPageNumber,
          },
        },
      });
    } catch (error:any) {
      next(error);
    }
  }

  async getNearbySalons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { longitude, latitude, radius = 5000, search = "", maxPrice = 100000, ratings = "", discount = "", page = 1, limit = 6, sort = "rating_desc" } = req.query;

      const params = {
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        radius: parseInt(radius as string) || 5000,
        search: search as string,
        maxPrice: parseFloat(maxPrice as string) || 100000,
        ratings: ratings ? (ratings as string).split(",").map(Number).filter(n => n >= 1 && n <= 5) : [],
        discount: parseFloat(discount as string) || 0,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 6,
        sort: sort as string,
      };

      // if (!params.longitude || !params.latitude) {
      //   throw new CustomError(Messages.INVALID_SALON_DATA, HttpStatus.BAD_REQUEST);
      // }

      const result = await this._salonService.getNearbySalons(params);
      res.status(HttpStatus.OK).json({
        message: Messages.NEARBY_SALONS_RETRIEVED,
        salons: result.salons,
        paginations: {
          currentPage: params.page,
          totalPages: result.totalPages,
          totalSalons: result.totalSalons,
          limit: params.limit,
        },
      });
    } catch (error:any) {
      next(error);
    }
  }

  async getSalonData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.query.id as string;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.SALON_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const result = await this._salonService.getSalonData(id);
      res.status(HttpStatus.OK).json({
        message: Messages.SALON_DATA_FETCHED,
        salonData: result,
      });
    } catch (error:any) {
       next(error);
    }
  }

  async updateSalon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body)
      const { id }= req.body;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(Messages.INVALID_SALON_ID, HttpStatus.BAD_REQUEST);
      }

      const updatedData = await this._salonService.salonProfileUpdate(req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.PROFILE_UPDATED,
        updatedData,
      });
    } catch (error:any) {
      next(error);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { salonId } = req.body;
      const file = req.file?.path;
      if (!salonId || !mongoose.Types.ObjectId.isValid(salonId)) {
        throw new CustomError(Messages.INVALID_SALON_ID, HttpStatus.BAD_REQUEST);
      }
      if (!file) {
        throw new CustomError(Messages.NO_FILE_UPLOADED, HttpStatus.BAD_REQUEST);
      }

      const result = await this._salonService.uploadSalonImage(salonId, file);
      res.status(HttpStatus.OK).json({
        message: Messages.IMAGE_UPLOADED,
        updatedSalonData: result,
      });
    } catch (error:any) {
       next(error);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { salonId, imageId, cloudinaryImageId } = req.body;
      if (!salonId || !imageId || !mongoose.Types.ObjectId.isValid(salonId) || !mongoose.Types.ObjectId.isValid(imageId)) {
        throw new CustomError(Messages.INVALID_IMAGE_DATA, HttpStatus.BAD_REQUEST);
      }

      const result = await this._salonService.deleteSalonImage(salonId, imageId, cloudinaryImageId);
      res.status(HttpStatus.OK).json({
        message: Messages.IMAGE_DELETED,
        updatedSalonData: result,
      });
    } catch (error:any) {
      next(error);
    }
  }


  async addService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { salonId, ...serviceData } = req.body;
      console.log("we have entered")
      console.log(req.body)
      if (!salonId || !mongoose.Types.ObjectId.isValid(salonId) || !serviceData.name || !serviceData.price || !serviceData.duration) {
        console.log("we entered here")
        throw new CustomError(Messages.INVALID_SERVICE_DATA, HttpStatus.BAD_REQUEST);
      }

      const result = await this._salonService.addService(req.body);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_ADDED,
        updatedSalonData: result,
      });
    } catch (error:any) {
       next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requiredFields = ["salonId", "serviceId", "name", "description", "price", "service", "duration", "stylists"];
      const missingFields = requiredFields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
        throw new CustomError(`Missing fields: ${missingFields.join(", ")}`, HttpStatus.BAD_REQUEST);
      }
      if (!mongoose.Types.ObjectId.isValid(req.body.salonId) || !mongoose.Types.ObjectId.isValid(req.body.serviceId)) {
        throw new CustomError(Messages.INVALID_SERVICE_DATA, HttpStatus.BAD_REQUEST);
      }

      const data = {
        ...req.body,
        price: Number(req.body.price),
        duration: Number(req.body.duration),
        stylists: Array.isArray(req.body.stylists) ? req.body.stylists : [],
      };

      const result = await this._salonService.updateService(data);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_UPDATED,
        result,
      });
    } catch (error:any) {
       next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { salonId, serviceId } = req.body;
      if (!salonId || !serviceId || !mongoose.Types.ObjectId.isValid(salonId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new CustomError(Messages.INVALID_SERVICE_ID, HttpStatus.BAD_REQUEST);
      }

      const result = await this._salonService.removeService(salonId, serviceId);
      res.status(HttpStatus.OK).json({
        message: Messages.SERVICE_DELETED,
        updatedSalonData: result,
      });
    } catch (error:any) {
       next(error);
    }
  }
}

export default SalonController;