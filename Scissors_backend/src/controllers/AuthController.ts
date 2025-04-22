import { NextFunction, Request,Response } from "express";
import jwt from 'jsonwebtoken'
import { salonService, userService } from "../config/di";
import CustomError from "../Utils/cutsomError";

export interface TokenPayload {
    id: string;
    role: string;
    refresh?: boolean; 
  }
  
class AuthController{
    async refreshToken(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            console.log(req.cookies)
            const refreshToken  = req.cookies.refreshToken
            console.log(refreshToken,"refreshToken")
            if(!refreshToken){
                return next(new CustomError( "No refresh token provided. Please log in again.",401));
            }

            const decoded =  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET!) as TokenPayload
            
            // if(!decoded.refresh){
            //    return  res.status(401).json({message:"Invalid Token Type"})
            // }
            let user
            console.log(decoded,"decoded")
            if (decoded.role === 'User' || decoded.role === 'Admin') {
                user = await userService.getUserById(decoded.id);
            }

            user = await salonService.findSalon(decoded.id)
           
            if(!user || user.refreshToken!==refreshToken){
                return next(new CustomError("Invalid refresh token. Please log in again.",401));
            }
            const newAccessToken = jwt.sign({
                id:user?._id,
                role:user?.role
            },process.env.JWT_SECRET as string,{expiresIn:'15m'})
        
            return res.cookie("authToken",newAccessToken,{
                path:'/',
                httpOnly:true,
                maxAge:15*60*1000,
                secure:false,
            }).json({message:"Token refreshed successfully",accesstoken:newAccessToken})
        } catch (error:any) {
            return next(new CustomError(error.message || "An unexpected error occurred while refreshing the token.",500));
        }
    }
}

export default new AuthController()