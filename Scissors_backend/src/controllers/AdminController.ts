import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { salonService, userService } from "../config/di";

class AdminController {
  async adminLogin(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (user.role !== "Admin") {
        return res.status(401).json({ message: "Unauthorized Access" });
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
      res.status(500).json({ error: error.message || "Internal Server Issue" });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<any> {
    try {
      const { id, firstname, lastname, phone } = req.body;
      const updatedData = { firstname, lastname, phone };
      const updatedAdmin = await userService.updateUser(id, updatedData, true);
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      return res
        .status(200)
        .json({ message: "Profile Updated Successfully", updatedAdmin });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Issue" });
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
      return res.status(200).json({ message: "Password Updated Successfully" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Issue" });
    }
  }

  async blockUnblockUser(req: Request, res: Response): Promise<any> {
    try {
      const { userId, isActive } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "No Id Found" });
      }
      const updatedUser = await userService.updateUserStatus(userId, isActive);
      return res
        .status(200)
        .json({ message: "Updated Successfully", updatedUser });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error?.message || "Internal Server Issue" });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ message: "No Id Found" });
      }

      const deletedUser = await userService.deleteUser(id);
      return res
        .status(200)
        .json({
          message: "User Deleted Successfull",
          deletedUser: deletedUser,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error?.message || "Internal Server Issue" });
    }
  }

  async getUsers(req: Request, res: Response): Promise<any> {
    try {
      const { page, limit } = req.body;
      const { data: userData, totalCount: totalUsers } =
        await userService.getAllUsers(page, limit);
      const totalUserPages = Math.ceil(totalUsers / 10);
      if (!userData) {
        return res.status(400).json({ message: "No User Data Found" });
      }
      return res
        .status(200)
        .json({
          message: "User Data Fetched Successfully",
          userData: { userData, totalUserPages },
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error?.message || "Internal Server Issue" });
    }
  }

  async getSalons(req: Request, res: Response): Promise<any> {
    try {
      const { page } = req.body;
      const salonData = await salonService.getAllSalons(page);
      const totalSalonPages = Math.ceil(salonData.totalCount/10)
      res
        .status(200)
        .json({
          message: "SalonData fethced Successfully",
          salonData: salonData,
          totalPages:totalSalonPages
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error?.message || "Internal Server Issue" });
    }
  }

  async blockAndUnblockSalon(req: Request, res: Response): Promise<any> {
    try {
      const { salonId, isActive } = req.body;
      if (!salonId) {
        return res.status(400).json({ message: "No Id Found" });
      }
      const updatedSalon = await salonService.updateSalonStatus(
        salonId,
        isActive
      );
      return res
        .status(200)
        .json({ message: "Salon data updated Successfully", updatedSalon });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Issue" });
    }
  }

  async signOut(req: Request, res: Response): Promise<any> {
    try {
      res
        .clearCookie("authToken", { path: "/",  httpOnly: true,secure: false})
        .clearCookie("refreshToken",{ path:"/",  httpOnly: true,secure: false})
        .status(200)
        .json({ message: "Logged Out Successfully!" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error?.message || "Internal Server Issue" });
    }
  }

  

  async addNewCategory(req: Request, res: Response): Promise<any> {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        return res
          .status(400)
          .json({ error: "Category Name and Description is needed" });
      }
      // const result  = await salonService.
    } catch (error: any) {
      return res
        .status(200)
        .json({ error: error.message || "Internal Server Issue" });
    }
  }
}

export default new AdminController();
