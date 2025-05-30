import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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
      if (!email || !password) {
        throw new CustomError(Messages.MISSING_LOGIN_CREDENTIALS, HttpStatus.BAD_REQUEST);
      }

      const user = await this._userService.getUserByEmail(email);
      if (!user) {
        throw new CustomError(Messages.LOGIN_ERROR, HttpStatus.UNAUTHORIZED);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError(Messages.LOGIN_ERROR, HttpStatus.UNAUTHORIZED);
      }

      if (user.role !== "Admin") {
        throw new CustomError(Messages.UNAUTHORIZED_ADMIN, HttpStatus.UNAUTHORIZED);
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, active: user.is_Active },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: user._id, role: user.role, active: user.is_Active },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "7d" }
      );

      await this._userService.updateRefreshToken(user._id as string, refreshToken);

      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: false,
        maxAge: 0,
      };

      res
        .cookie("authToken", token, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .status(HttpStatus.OK)
        .json({
          message: Messages.LOGIN_SUCCESS,
          user: user._doc,
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

      if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
      }

      const { data: userData, totalCount: totalUsers } = await this._userService.getAllUsers(
        pageNumber,
        limitNumber,
        search as string
      );
      const totalUserPages = Math.ceil(totalUsers / limitNumber);
      if (!userData.length) {
        throw new CustomError(Messages.NO_USER_DATA_FOUND, HttpStatus.NOT_FOUND);
      }
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

      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
      }

      const salonData = await this._salonService.getAllSalons(pageNumber, search as string);
      const totalSalonPages = Math.ceil(salonData.totalCount / 10);

      res.status(HttpStatus.OK).json({
        message: Messages.SALON_DATA_FETCHED_ADMIN,
        salonData,
        totalPages: totalSalonPages,
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