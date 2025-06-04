import jwt from "jsonwebtoken";
import CustomError from "../Utils/cutsomError";
import { IAuthService, TokenPayload } from "../Interfaces/Auth/IAuthService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { IUserService } from "../Interfaces/User/IUserService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import { IUserDocument } from "../models/User";
import { ISalonDocument } from "../models/Salon";

class AuthService implements IAuthService {
  private _salonService: ISalonService;
  private _userService: IUserService;

  constructor(salonService: ISalonService, userService: IUserService) {
    this._salonService = salonService;
    this._userService = userService;
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    entity: IUserDocument | ISalonDocument;
    role: string;
  }> {
    if (!refreshToken) {
      throw new CustomError(Messages.MISSING_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
    } catch (error) {
      throw new CustomError(Messages.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    let entity: IUserDocument | ISalonDocument | null;
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
      (entity as any).refreshToken !== refreshToken ||
      !(entity as any).refreshTokenExpiresAt ||
      (entity as any).refreshTokenExpiresAt < new Date()
    ) {
      throw new CustomError(Messages.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const newAccessToken = jwt.sign(
      { id: (entity as any)._id, role: decoded.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    return {
      accessToken: newAccessToken,
      entity,
      role: decoded.role,
    };
  }
}

export default AuthService;