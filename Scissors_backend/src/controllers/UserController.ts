import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import { IUserService } from "../Interfaces/User/IUserService";
import { plainToClass } from "class-transformer";
import { CreateUserDto, UpdateUserDto } from "../dto/user.dto";
import { validate } from "class-validator";

class UserController {
  private _userService: IUserService;

  constructor(userService: IUserService) {
    this._userService = userService;
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createUserDto = plainToClass(CreateUserDto, req.body);
            const errors = await validate(createUserDto);
            if (errors.length > 0) {
                throw new CustomError(
                    Messages.INVALID_USER_DATA,
                    HttpStatus.BAD_REQUEST,
      
                );
            }
      const newUser = await this._userService.createUser(createUserDto);
      res.status(HttpStatus.CREATED).json({
        message: Messages.USER_CREATED,
        user: newUser,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async userLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this._userService.loginUser(email, password);
      console.log(result?.user)
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
      next(error);
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
      next(error);
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
      next(error);
    }
  }

  async sentOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const message = await this._userService.sendOtp(email);
      res.status(HttpStatus.OK).json({ message });
    } catch (error: any) {
      next(error);
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
      next(error);
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
      console.log(req.body,"idd")
      const updateUserDto = plainToClass(UpdateUserDto, req.body);
      console.log(updateUserDto,"dto")
            const errors = await validate(updateUserDto);
            if (errors.length > 0) {
              console.log("Error here")
                throw new CustomError(
                    Messages.INVALID_USER_DATA,
                    HttpStatus.BAD_REQUEST,
                );
            }
      const updatedUser = await this._userService.updateUser(updateUserDto.id as string,
                updateUserDto,
                false);
      res.status(HttpStatus.OK).json({
        message: Messages.PROFILE_UPDATED,
        user: updatedUser
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