import { Request,Response,NextFunction } from "express";
import { CustomRequest } from "./verifyToken";


const checkRole = (allowedRoles:string[])=>{
    return (req:CustomRequest,res:Response,next:NextFunction)=>{
        const userRole = req.user?.role

        if(userRole && allowedRoles.includes(userRole)){
            next()
        }else{
            res.status(403).json({message:"Forbidden:Insufficient permissions"})
        }
    }
}

export default checkRole