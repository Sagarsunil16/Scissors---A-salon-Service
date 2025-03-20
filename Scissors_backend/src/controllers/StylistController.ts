import { NextFunction, Request, Response } from "express";
import { stylistService } from "../config/di";
import CustomError from "../Utils/cutsomError";

class StylistController {
  async createStylist(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      console.log(req.body)
      const result = await stylistService.createStylist(req.body);
      res.status(200).json({ message: "Stylist created successfully.", result });
    } catch (error: any) {
      next(new CustomError("There was an issue creating the stylist. Please try again.", 500));
    }
  }

  async getStylistbySalonId(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { id, page, limit, search } = req.query;
      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      };
      const result = await stylistService.findStylist(
        id as string,
        options,
        search as string
      );
      console.log(result);
      res
        .status(200)
        .json({ message: "Stylist data fetched successfully.", result });
    } catch (error: any) {
      next(new CustomError("Unable to fetch stylist data. Please try again later.", 500));
    }
  }

  async updateStylist(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const updatedStylist = await stylistService.updateStylist(
        req.params.id,
        req.body
      );
      if (!updatedStylist) {
        return next(new CustomError("Stylist not found. Please check the provided details.", 404));
      }

      res.json({
        message: "Stylist updated successfully.",
        success: true,
        data: updatedStylist,
      });
    } catch (error: any) {
      next(new CustomError("There was an issue updating the stylist. Please try again.", 400));
    }
  }

  async getStylistById(req:Request,res:Response, next:NextFunction):Promise<any>{
    try {
        const id = req.params.id
        console.log(id)
        const result = await stylistService.findStylistById(id)
        if(!result){
          return next(new CustomError("Stylist not found. Please check the provided details.", 400));
        }
        console.log(result)
        return res.status(200).json({message:"Stylist fetched successfully.",result})
    } catch (error:any) {
      next(new CustomError("Unable to fetch stylist details. Please try again later.", 500));
    }
  }

  async deleteStylist(req:Request,res:Response, next:NextFunction):Promise<any>{
    try {
      const id = req.params.id 
      const result = stylistService.deleteStylist(id)
      if (!result) {
        return next(new CustomError("Stylist not found. Unable to delete.", 404));
      }
      return res.status(200).json({message:"Stylist deleted Successfully",result})
    } catch (error:any) {
      next(new CustomError("Unable to delete stylist. Please try again.", 500));
    }
  }

  
}

export default new StylistController();
