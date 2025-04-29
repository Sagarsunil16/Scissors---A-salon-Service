import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { salonService, userService } from "../config/di";
import CustomError from "../Utils/cutsomError";

class AdminController {
  async adminLogin(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new CustomError("Email and password are required to login.", 400));
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        return next(new CustomError("Invalid email or password. Please check your credentials.", 401));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next(new CustomError("Invalid email or password. Please check your credentials.", 401));
      
      }
      if (user.role !== "Admin") {
        return next(new CustomError("Unauthorized access. Admin privileges required.", 401));
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        {id:user._id,role:user.role},
        process.env.REFRESH_TOKEN_SECRET as string,
        {expiresIn:"7d"}
      )

      await userService.updateRefreshToken(user._id as string,refreshToken)
      const adminData = user._doc;
      const cookieOptions = {
        path:'/',
        httpOnly:true,
        secure:false,
        maxAge:0
      }
      
      res
        .cookie("authToken", token, {...cookieOptions,maxAge:15*60*1000 })
        .cookie("refreshToken",refreshToken,{...cookieOptions,maxAge:7 * 24  * 60 * 60 * 1000})
        .status(200)
        .json({
          message: "Login Successfull",
          user: adminData,
        });

    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  async updateProfile(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { id, firstname, lastname, phone } = req.body;
      const updatedData = { firstname, lastname, phone };
      const updatedAdmin = await userService.updateUser(id, updatedData, true);
      if (!updatedAdmin) {
        return next(new CustomError("Admin not found", 404));
      }
      return res
        .status(200)
        .json({ message: "Profile Updated Successfully", updatedAdmin });
    } catch (error: any) {
      return res
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  async changePassword(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { id, currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return next(new CustomError("Current and new passwords are required", 400));
      }
      await userService.changePassword(id, currentPassword, newPassword);
      return res.status(200).json({ message: "Password Updated Successfully" });
    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  async blockUnblockUser(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { userId, isActive } = req.body;
      if (!userId) {
        return next(new CustomError("No User ID provided", 400));
      }
      const updatedUser = await userService.updateUserStatus(userId, isActive);
      return res
        .status(200)
        .json({ message: "Updated Successfully", updatedUser });
    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  async deleteUser(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { id } = req.body;
      if (!id) {
        return next(new CustomError("No User ID provided", 400));
      }

      const deletedUser = await userService.deleteUser(id);
      return res
        .status(200)
        .json({
          message: "User Deleted Successfull",
          deletedUser: deletedUser,
        });
    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  async getUsers(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { page, limit,search } = req.query;
      console.log(search)
      const { data: userData, totalCount: totalUsers } =
        await userService.getAllUsers(Number(page), Number(limit),search as string);
      const totalUserPages = Math.ceil(totalUsers / 10);
      if (!userData) {
        return next(new CustomError("No User Data Found", 400));
      }
      return res
        .status(200)
        .json({
          message: "User Data Fetched Successfully",
          userData: { userData, totalUserPages },
        });
    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  async getSalons(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const {page,search} = req.query
      const salonData = await salonService.getAllSalons(Number(page),search as string);
      const totalSalonPages = Math.ceil(salonData.totalCount/10)
      res
        .status(200)
        .json({
          message: "SalonData fethced Successfully",
          salonData: salonData,
          totalPages:totalSalonPages
        });
    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  async blockAndUnblockSalon(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { salonId, isActive } = req.body;
      if (!salonId) {
        return next(new CustomError("No Salon ID provided", 400));
      }
      const updatedSalon = await salonService.updateSalonStatus(
        salonId,
        isActive
      );
      return res
        .status(200)
        .json({ message: "Salon data updated Successfully", updatedSalon });
    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  async signOut(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      res
        .clearCookie("authToken", { path: "/",  httpOnly: true,secure: false})
        .clearCookie("refreshToken",{ path:"/",  httpOnly: true,secure: false})
        .status(200)
        .json({ message: "Logged Out Successfully!" });
    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }

  

  async addNewCategory(req: Request, res: Response,next:NextFunction): Promise<any> {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        return next(new CustomError("Category name and description are required", 400));
      }
      // const result  = await salonService.
    } catch (error: any) {
      return next(new CustomError(error.message || "Internal Server Issue", 500));
    }
  }
}

export default new AdminController();
