import { Request, Response } from "express";
import { userService } from "../config/di";

class UserController {
  async createUser(req: Request, res: Response): Promise<any> {
    try {
      const newUser = await userService.createUser(req.body);
      res
        .status(201)
        .json({ message: "Account created successfully", user: newUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server Error" });
    }
  }

  async userLogin(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;
      const result = await userService.loginUser(email, password);
      const cookieOptions = {
        path:'/',
        httpOnly:true,
        secure:false,
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
          message: "Login successfull",
          user: result?.user,
        });
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Invalid credentials" });
    }
  }

  async googleLogin(req: Request, res: Response): Promise<any> {
    try {
      const { token,refreshToken } = req.body;
      const cookieOptions = {
        path:'/',
        httpOnly:true,
        secure:false,
        maxAge:0
      }
      const result = await userService.googleLogin(token,refreshToken);
      res
        .cookie("authToken", result?.token,{
          ...cookieOptions,maxAge:15*60*1000
        } ).cookie("refreshToken",refreshToken,{
          ...cookieOptions,maxAge:7*24*60*60*1000
        } )
        .status(200)
        .json({ message: "Login Successfull", user: result?.user });
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Invalid credentials" });
    }
  }

  async userSignOut(req: Request, res: Response): Promise<any> {
   
    res
      .clearCookie("authToken", { path: "/", httpOnly: true, secure: false })
      .clearCookie("refreshToken",{ path: "/", httpOnly: true, secure: false })
      .status(200)
      .json({ message: "Logged Out Successfully!" });
   
  }

  async sentOtp(req: Request, res: Response): Promise<any> {
    try {
      const { email } = req.body;
      const message = await userService.sendOtp(email);
      res.status(200).json({ message: message });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<any> {
    try {
      const { email, otp } = req.body;
      const isValid = await userService.verifyOTP(email, otp);
      res.status(200).json({ message: "OTP verified Successfully", isValid });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;
      const message = await userService.resetPasssword(email, password);
      res.status(200).json({ message: message });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateUser(req: Request, res: Response): Promise<any> {
    try {
      const { id, firstname, lastname, phone, address } = req.body;
      const updatedData = { firstname, lastname, phone, address };
      const updatedUser = await userService.updateUser(id, updatedData, false);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser._doc,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async changePassword(req: Request, res: Response): Promise<any> {
    try {
      const { id, currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "current and new passwords are required" });
      }
      await userService.changePassword(id, currentPassword, newPassword);
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error: any) {
      console.error("Error changing password:", error.message);
      return res.status(500).json({ message: error.message });
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

export default new UserController();
