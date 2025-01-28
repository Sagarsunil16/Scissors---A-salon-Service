import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {userService} from "../config/di";


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
        return res.status(401).json({ message: "Unauthorize Acces" });
      }

      const userData = await userService.getAllUsers()

      const token = Jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      const adminData = user._doc;

      return res
        .cookie("authToken", token, { httpOnly: true, maxAge: 60 * 60 * 1000 })
        .status(200)
        .json({ message: "Login Successfull", user: adminData,userData:userData });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal Server Issue" });
    }
  }

  async blockUnblockUser(req:Request,res:Response):Promise<any>{
    try {
      const {userId,isActive} = req.body
      if(!userId){
        return res.status(400).json({message:"No Id Found"})
      }
      const updatedUser = await userService.updateUserStatus(userId,isActive)
      return res.status(200).json({message:"Updated Successfully",updatedUser})
    } catch (error:any) {
      return res.status(500).json({error:error?.message || "Internal Server Issue"})
    }
  }

  async deleteUser(req:Request,res:Response):Promise<any>{
    try {
      const {id} = req.body
      if(!id){
        return res.status(400).json({message:"No Id Found"})
      }
      
      const deletedUser = await userService.deleteUser(id)
      return res.status(200).json({message:"User Deleted Successfull",deletedUser:deletedUser})
    } catch (error:any) {
      return res.status(500).json({error:error?.message || "Internal Server Issue"})
    }
  }

  async signOut(req:Request,res:Response):Promise<any>{
    try {
        res.clearCookie("authToken",{path:'/admin/login'}).status(200).json({message:"Logged Out Successfully!"})
    } catch (error:any) {
        return res.status(500).json({error:error?.message || "Internal Server Issue"})
    }
  }
}

export default new AdminController();
