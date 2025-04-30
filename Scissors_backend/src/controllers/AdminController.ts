import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import CustomError from "../Utils/cutsomError";
import UserService from "../services/UserService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { IUserService } from "../Interfaces/User/IUserService";


class AdminController {
  private userService: IUserService;
  private salonService: ISalonService;

  constructor(userService: IUserService, salonService: ISalonService) {
    this.userService = userService;
    this.salonService = salonService;
  }

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new CustomError("Email and password are required to login.", 400);
      }

      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new CustomError("Invalid email or password. Please check your credentials.", 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError("Invalid email or password. Please check your credentials.", 401);
      }

      if (user.role !== "Admin") {
        throw new CustomError("Unauthorized access. Admin privileges required.", 401);
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

      await this.userService.updateRefreshToken(user._id as string, refreshToken);

      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: false,
        maxAge: 0,
      };

      res
        .cookie("authToken", token, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .status(200)
        .json({
          message: "Login successful",
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
        throw new CustomError("ID, firstname, lastname, and phone are required.", 400);
      }
      const updatedData = { firstname, lastname, phone };
      const updatedAdmin = await this.userService.updateUser(id, updatedData, true);
      if (!updatedAdmin) {
        throw new CustomError("Admin not found.", 404);
      }
      res.status(200).json({ message: "Profile updated successfully.", updatedAdmin });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, currentPassword, newPassword } = req.body;
      if (!id || !currentPassword || !newPassword) {
        throw new CustomError("ID, current password, and new password are required.", 400);
      }
      await this.userService.changePassword(id, currentPassword, newPassword);
      res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      next(error);
    }
  }

  async blockUnblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, isActive } = req.body;
      if (!userId || isActive === undefined) {
        throw new CustomError("User ID and isActive status are required.", 400);
      }
      const updatedUser = await this.userService.updateUserStatus(userId, isActive);
      res.status(200).json({ message: "User status updated successfully.", updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body;
      if (!id) {
        throw new CustomError("User ID is required.", 400);
      }
      const deletedUser = await this.userService.deleteUser(id);
      res.status(200).json({
        message: "User deleted successfully.",
        deletedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", limit = "10", search = "" } = req.query;
      const { data: userData, totalCount: totalUsers } = await this.userService.getAllUsers(
        Number(page),
        Number(limit),
        search as string
      );
      const totalUserPages = Math.ceil(totalUsers / Number(limit));
      if (!userData.length) {
        throw new CustomError("No user data found.", 404);
      }
      res.status(200).json({
        message: "User data fetched successfully.",
        userData: { userData, totalUserPages },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = "1", search = "" } = req.query;
      const salonData = await this.salonService.getAllSalons(Number(page), search as string);
      const totalSalonPages = Math.ceil(salonData.totalCount / 10);
      res.status(200).json({
        message: "Salon data fetched successfully.",
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
        throw new CustomError("Salon ID and isActive status are required.", 400);
      }
      const updatedSalon = await this.salonService.updateSalonStatus(salonId, isActive);
      res.status(200).json({ message: "Salon status updated successfully.", updatedSalon });
    } catch (error) {
      next(error);
    }
  }

  async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await this.userService.signOut(refreshToken);
      }
      res
        .clearCookie("authToken", { path: "/", httpOnly: true, secure: false })
        .clearCookie("refreshToken", { path: "/", httpOnly: true, secure: false })
        .status(200)
        .json({ message: "Logged out successfully." });
    } catch (error) {
      next(error);
    }
  }
   
}

export default AdminController;