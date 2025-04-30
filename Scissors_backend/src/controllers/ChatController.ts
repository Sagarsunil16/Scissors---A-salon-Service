import { Request, Response, NextFunction } from "express";
import CustomError from "../Utils/cutsomError";
import SalonService from "../services/SalonService";
import { IMessageService } from "../Interfaces/Messages/IMessageService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";


interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

class ChatController {
  private messageService: IMessageService
  private salonService: ISalonService
  constructor(messageService:IMessageService,salonService:ISalonService){
    this.messageService = messageService;
    this.salonService = salonService;
  }
  async getUserChats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.log("error 1")
        return next(new CustomError("User ID is required", 400));
      }
      const chats = await this.messageService.getUserChats(userId);
      const salons =  await this.salonService.allSalonListForChat()
      res.status(200).json({chats,salons});
    } catch (error: any) {
      console.log("Error in getUserChats:", error);
      return next(new CustomError(error.message || "Internal Server Issues", 500));
    }
  }

  async getSalonChats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const salonId = req.user?.id;
      if (!salonId) {
        return next(new CustomError("Salon ID is required", 400));
      }
      const chats = await this.messageService.getSalonChats(salonId);
      res.status(200).json(chats);
    } catch (error: any) {
      console.log("Error in getSalonChats:", error);
      return next(new CustomError(error.message || "Internal Server Issues", 500));
    }
  }
}

export default ChatController