import { NextFunction, Request, Response } from "express";
import CustomError from "../Utils/cutsomError";
import { SUCCESS_MESSAGES,ERROR_MESSAGES } from "../constants";
import { IUserService } from "../Interfaces/User/IUserService";
class UserController {
  private userService: IUserService
  constructor(userService:IUserService){
    this.userService = userService
  }
  async createUser(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const newUser = await this.userService.createUser(req.body);
      res
        .status(201)
        .json({ message: SUCCESS_MESSAGES.USER_CREATED, user: newUser });
    } catch (error: any) {
      next(new CustomError("Oops! Something went wrong while creating your account. Please try again later.", 500));
    }
  }

  async userLogin(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { email, password } = req.body;
      const result = await this.userService.loginUser(email, password);
      const cookieOptions = {
        path:'/',
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        maxAge:0
      }
      res
        .cookie("authToken", result?.accessToken, {
          ...cookieOptions,maxAge:15*60*1000
        })
        .cookie("refreshToken",result?.refreshToken,{
          ...cookieOptions,maxAge:7*24*60*60*1000
        })
        .status(200)
        .json({
          message: "You have logged in successfully!",
          user: result?.user,
        });
    } catch (error: any) {
      next(new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401));
    }
  }

  async googleLogin(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { token } = req.body;
      const cookieOptions = {
        path:'/',
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        maxAge:0
      }
      
      const result = await this.userService.googleLogin(token);
      
      res
        .cookie("authToken", result?.token,{
          ...cookieOptions,maxAge:15*60*1000
        } ).cookie("refreshToken",result?.refreshToken,{
          ...cookieOptions,maxAge:7*24*60*60*1000
        } )
        .status(200)
        .json({ message: "You have successfully logged in with Google!", user: result?.user });
    } catch (error: any) {
      next(new CustomError("There was an issue logging you in with Google. Please try again.", 401)); 
    }
  }

  async userSignOut(req: Request, res: Response,next:NextFunction): Promise<any> {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
      await this.userService.signOut(refreshToken);
    }
    res
      .clearCookie("authToken", { path: "/", httpOnly: true, secure: false })
      .clearCookie("refreshToken",{ path: "/", httpOnly: true, secure: false })
      .status(200)
      .json({ message: "You have been logged out successfully. See you next time!" });
   
  }

  async sentOtp(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { email } = req.body;
      const message = await this.userService.sendOtp(email);
      res.status(200).json({ message: message });
    } catch (error: any) {
      next(new CustomError("We couldn't send the OTP. Please try again later.", 400));
    }
  }

  async verifyOtp(req: Request, res: Response ,next:NextFunction): Promise<any> {
    try {
      const { email, otp } = req.body;
      const isValid = await this.userService.verifyOTP(email, otp);
      res.status(200).json({ message: "Your OTP has been verified successfully!", isValid });
    } catch (error: any) {
      next(new CustomError("The OTP you entered is invalid or expired. Please try again.", 400));
    }
  }

  async resetPassword(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { email, password } = req.body;
      const message = await this.userService.resetPassword(email, password);
      res.status(200).json({ message: SUCCESS_MESSAGES.PASSWORD_RESET });
    } catch (error: any) {
      next(new CustomError("Something went wrong while resetting your password. Please try again.", 400));
    }
  }

  async updateUser(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { id, firstname, lastname, phone, address } = req.body;
      const updatedData = { firstname, lastname, phone, address };
      const updatedUser = await this.userService.updateUser(id, updatedData, false);
      if (!updatedUser) {
        throw new CustomError("We couldn't find your profile. Please make sure you're logged in.", 404);
      }
      return res.status(200).json({
        message: "Your profile has been updated successfully!",
        user: updatedUser._doc,
      });
    } catch (error: any) {
      next(new CustomError("Oops! Something went wrong while updating your profile. Please try again.", 500));
    }
  }

  async changePassword(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { id, currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        throw new CustomError("Please provide both your current and new password to proceed.", 400);
      }
      await this.userService.changePassword(id, currentPassword, newPassword);
      return res.status(200).json({ message: "Your password has been updated successfully!" });
    } catch (error: any) {
      next( new CustomError("Oops! Something went wrong while changing your password. Please try again later.", 500));
    }
  }

  async getAllSalons(req: Request, res: Response): Promise<any> {
    try {
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Internal server Issue" });
    }
  }
}

export default UserController
