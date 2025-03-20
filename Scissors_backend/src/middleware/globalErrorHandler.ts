import { Request,Response,NextFunction } from "express";
import CustomError from "../Utils/cutsomError";

const globalErrorHandler = (err:any,req:Request,res:Response,next:NextFunction)=>{
    if(err instanceof CustomError){
        return res.status(err.statusCode).json({
            error:err.message
        })
    }
    console.log(err)
    return res.status(500).json({
        error:"Something went wrong. Please try again later."
    })
}

export default globalErrorHandler