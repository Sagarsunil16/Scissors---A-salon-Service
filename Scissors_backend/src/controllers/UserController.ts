import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import { IUserService } from "../Interfaces/User/IUserService";

class UserController {
  private _userService: IUserService;

  constructor(userService: IUserService) {
    this._userService = userService;
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newUser = await this._userService.createUser(req.body);
      res.status(HttpStatus.CREATED).json({
        message: Messages.USER_CREATED,
        user: newUser,
      });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.CREATE_USER_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async userLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this._userService.loginUser(email, password);
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      res
        .cookie("authToken", result?.accessToken, {
          ...cookieOptions,
          maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", result?.refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(HttpStatus.OK)
        .json({
          message: Messages.USER_LOGGED_IN,
          user: result?.user,
        });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.USER_LOGIN_FAILED, HttpStatus.UNAUTHORIZED));
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      const result = await this._userService.googleLogin(token);
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      res
        .cookie("authToken", result?.token, {
          ...cookieOptions,
          maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", result?.refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(HttpStatus.OK)
        .json({
          message: Messages.GOOGLE_LOGIN_SUCCESS,
          user: result?.user,
        });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.GOOGLE_LOGIN_FAILED, HttpStatus.UNAUTHORIZED));
    }
  }

  async userSignOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await this._userService.signOut(refreshToken);
      }

      res
        .clearCookie("authToken", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" })
        .clearCookie("refreshToken", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" })
        .status(HttpStatus.OK)
        .json({ message: Messages.LOGGED_OUT });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.SIGN_OUT_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async sentOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const message = await this._userService.sendOtp(email);
      res.status(HttpStatus.OK).json({ message });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.SEND_OTP_FAILED, HttpStatus.BAD_REQUEST));
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const isValid = await this._userService.verifyOTP(email, otp);
      res.status(HttpStatus.OK).json({
        message: Messages.OTP_VERIFIED,
        isValid,
      });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.VERIFY_OTP_FAILED, HttpStatus.BAD_REQUEST));
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const message = await this._userService.resetPassword(email, password);
      res.status(HttpStatus.OK).json({ message: Messages.PASSWORD_RESET });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.RESET_PASSWORD_FAILED, HttpStatus.BAD_REQUEST));
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, firstname, lastname, phone, address } = req.body;
      const updatedData = { firstname, lastname, phone, address };
      const updatedUser = await this._userService.updateUser(id, updatedData, false);
      res.status(HttpStatus.OK).json({
        message: Messages.PROFILE_UPDATED,
        user: updatedUser?._doc,
      });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.UPDATE_USER_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, currentPassword, newPassword } = req.body;
      await this._userService.changePassword(id, currentPassword, newPassword);
      res.status(HttpStatus.OK).json({ message: Messages.PASSWORD_UPDATED });
    } catch (error: any) {
      next(new CustomError(error.message || Messages.CHANGE_PASSWORD_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

export default UserController;