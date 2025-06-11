import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { IUserService } from "../Interfaces/User/IUserService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

class AdminController {
  private _userService: IUserService;
  private _salonService: ISalonService;

  constructor(userService: IUserService, salonService: ISalonService) {
    this._userService = userService;
    this._salonService = salonService;
  }

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await this._userService.adminLogin(email, password);

      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: false,
        maxAge: 0,
      };

      res
        .cookie("authToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .status(HttpStatus.OK)
        .json({
          message: Messages.LOGIN_SUCCESS,
          user: user
        });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, firstname, lastname, phone } = req.body;
      if (!id || !firstname || !lastname || !phone) {
        throw new CustomError(Messages.MISSING_PROFILE_FIELDS, HttpStatus.BAD_REQUEST);
      }
      const updatedData = { firstname, lastname, phone };
      const updatedAdmin = await this._userService.updateUser(id, updatedData, true);
      if (!updatedAdmin) {
        throw new CustomError(Messages.ADMIN_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      res.status(HttpStatus.OK).json({
        message: Messages.PROFILE_UPDATED,
        updatedAdmin,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, currentPassword, newPassword } = req.body;
      if (!id || !currentPassword || !newPassword) {
        throw new CustomError(Messages.MISSING_PASSWORD_FIELDS, HttpStatus.BAD_REQUEST);
      }
      await this._userService.changePassword(id, currentPassword, newPassword);
      res.status(HttpStatus.OK).json({
        message: Messages.PASSWORD_UPDATED,
      });
    } catch (error) {
      next(error);
    }
  }

  async blockUnblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, isActive } = req.body;
      if (!userId || isActive === undefined) {
        throw new CustomError(Messages.MISSING_USER_STATUS_FIELDS, HttpStatus.BAD_REQUEST);
      }
      const updatedUser = await this._userService.updateUserStatus(userId, isActive);
      res.status(HttpStatus.OK).json({
        message: Messages.USER_STATUS_UPDATED,
        updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body;
      if (!id) {
        throw new CustomError(Messages.MISSING_USER_ID, HttpStatus.BAD_REQUEST);
      }
      const deletedUser = await this._userService.deleteUser(id);
      res.status(HttpStatus.OK).json({
        message: Messages.USER_DELETED,
        deletedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", limit = "10", search = "" } = req.query;
      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      const { userData, totalUserPages } = await this._userService.getAllUsers(pageNumber, limitNumber, search as string);
      res.status(HttpStatus.OK).json({
        message: Messages.USER_DATA_FETCHED,
        userData: { userData, totalUserPages },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", search = "" } = req.query;
      const pageNumber = Number(page);

      const { salonData, totalPages } = await this._salonService.getAllSalons(pageNumber, search as string);
      res.status(HttpStatus.OK).json({
        message: Messages.SALON_DATA_FETCHED_ADMIN,
        salonData,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async blockAndUnblockSalon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { salonId, isActive } = req.body;
      if (!salonId || isActive === undefined) {
        throw new CustomError(Messages.MISSING_SALON_STATUS_FIELDS, HttpStatus.BAD_REQUEST);
      }
      const updatedSalon = await this._salonService.updateSalonStatus(salonId, isActive);
      res.status(HttpStatus.OK).json({
        message: Messages.SALON_STATUS_UPDATED,
        updatedSalon,
      });
    } catch (error) {
      next(error);
    }
  }

  async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await this._userService.signOut(refreshToken);
      }
      res
        .clearCookie("authToken", { path: "/", httpOnly: true, secure: false })
        .clearCookie("refreshToken", { path: "/", httpOnly: true, secure: false })
        .status(HttpStatus.OK)
        .json({
          message: Messages.LOGGED_OUT,
        });
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;