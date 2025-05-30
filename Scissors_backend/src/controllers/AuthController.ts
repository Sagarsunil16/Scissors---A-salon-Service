import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../Utils/cutsomError";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { IUserService } from "../Interfaces/User/IUserService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

export interface TokenPayload {
  id: string;
  role: string;
  refresh?: boolean;
}

class AuthController {
  private _salonService: ISalonService;
  private _userService: IUserService;

  constructor(salonService: ISalonService, userService: IUserService) {
    this._salonService = salonService;
    this._userService = userService;
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new CustomError(Messages.MISSING_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;

      let entity;
      if (decoded.role === "User" || decoded.role === "Admin") {
        entity = await this._userService.getUserById(decoded.id);
      } else if (decoded.role === "Salon") {
        entity = await this._salonService.findSalon(decoded.id);
      } else {
        throw new CustomError(Messages.INVALID_TOKEN_ROLE, HttpStatus.UNAUTHORIZED);
      }

      if (!entity) {
        throw new CustomError(Messages.ENTITY_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      if (
        entity.refreshToken !== refreshToken ||
        !entity.refreshTokenExpiresAt ||
        entity.refreshTokenExpiresAt < new Date()
      ) {
        throw new CustomError(Messages.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
      }

      const newAccessToken = jwt.sign(
        { id: entity._id, role: entity.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );

      res
        .cookie("authToken", newAccessToken, {
          path: "/",
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
        })
        .status(HttpStatus.OK)
        .json({ message: Messages.TOKEN_REFRESHED, accessToken: newAccessToken });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.TOKEN_REFRESH_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default AuthController;