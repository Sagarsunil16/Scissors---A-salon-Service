import {Response,NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { JwtPayload } from "jsonwebtoken";
import { salonService, userService } from "../config/di";
import { CustomRequest } from "./verifyToken";
import { decode } from "punycode";

const authMiddleware = async(req:CustomRequest,res:Response,next:NextFunction):Promise<any>=>{
    try {
        const token = req.cookies.authToken
        if(!token){
            return res.status(401).json({ message: "Unauthorized, No Token Provided" });
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload
        console.log(decoded,"decode in auth middleware")
        if (decoded.role === 'User' || decoded.role === 'Admin') {
            const user = await userService.getUserById(decoded.id)
            if(!user){
                return res.status(404).json({ message: "User Not Found" });
            }
    
            if (!user.is_Active) {
                return res.status(403).json({ message: "Access denied. User is blocked." });
            }
            req.user = user
        }
        if(decoded.role === "Salon"){
            const salon = await salonService.findSalon(decoded.id)
            if(!salon){
                return res.status(404).json({ message: "Salon Not Found" });
            }
            if (!salon.is_Active) {
                return res.status(403).json({ message: "Access denied. User is blocked." });
            }
            req.user = salon
        }
        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid Token" });
    }
}

export default authMiddleware
