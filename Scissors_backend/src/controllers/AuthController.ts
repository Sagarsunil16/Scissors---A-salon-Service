import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { IAuthService } from "../Interfaces/Auth/IAuthService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

class AuthController {
  private _authService: IAuthService;

  constructor(authService: IAuthService) {
    this._authService = authService;
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      const { accessToken } = await this._authService.refreshToken(refreshToken);

      res
        .cookie("authToken", accessToken, {
          path: "/",
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
        })
        .status(HttpStatus.OK)
        .json({ message: Messages.TOKEN_REFRESHED, accessToken });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.TOKEN_REFRESH_FAILED, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default AuthController;