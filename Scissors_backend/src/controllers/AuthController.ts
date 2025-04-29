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
            const refreshToken  = req.cookies.refreshToken
            console.log(refreshToken,"refreshToken")
            if(!refreshToken){
                return next(new CustomError( "No refresh token provided. Please log in again.",401));
            }

            const decoded =  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET!) as TokenPayload
            
            let entity
            if (decoded.role === 'User' || decoded.role === 'Admin') {
                entity = await userService.getUserById(decoded.id);
            }else if (decoded.role === 'Salon') {
                entity = await salonService.findSalon(decoded.id);
            } else {
                return next(new CustomError('Invalid role in token.', 401));
            }

            if (!entity) {
            return next(new CustomError('User or salon not found.', 401));
            }  
           
            if (
                entity.refreshToken !== refreshToken ||
                !entity.refreshTokenExpiresAt ||
                entity.refreshTokenExpiresAt < new Date()
              ) {
                return next(new CustomError('Invalid or expired refresh token. Please log in again.', 401));
              }
            const newAccessToken = jwt.sign({
                id:entity?._id,
                role:entity?.role
            },process.env.JWT_SECRET as string,{expiresIn:'15m'})
        
            return res.cookie("authToken",newAccessToken,{
                path:'/',
                httpOnly:true,
                maxAge:15*60*1000,
                secure:process.env.NODE_ENV === 'production',
            }).json({message:"Token refreshed successfully",accesstoken:newAccessToken})
        } catch (error:any) {
            return next(new CustomError(error.message || "An unexpected error occurred while refreshing the token.",500));
        }
    }
}

export default new AuthController()