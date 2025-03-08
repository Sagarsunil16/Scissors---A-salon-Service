import { Request,Response } from "express";
import jwt from 'jsonwebtoken'
import { userService } from "../config/di";
import { decode } from "punycode";

export interface TokenPayload {
    id: string;
    role: string;
    refresh?: boolean; 
  }
  
class AuthController{
    async refreshToken(req:Request,res:Response):Promise<any>{
        try {
            console.log(req.cookies)
            const refreshToken  = req.cookies.refreshToken
            console.log(refreshToken,"refreshToken")
            if(!refreshToken){
                return res.status(401).json({message:"No Refresh token provided"})
            }

            const decoded =  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET!) as TokenPayload
            
            // if(!decoded.refresh){
            //    return  res.status(401).json({message:"Invalid Token Type"})
            // }

            const user = await userService.getUserById(decoded.id);
            if(!user || user.refreshToken!==refreshToken){
                return res.status(401).json({message:"Invalid Refresh token"})
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
            }).json({message:"Token refreshed Successfully",accesstoken:newAccessToken})
        } catch (error:any) {
            return res.status(500).json({message:"Invalid Refresh token",error:error.message})
        }
    }
}

export default new AuthController()