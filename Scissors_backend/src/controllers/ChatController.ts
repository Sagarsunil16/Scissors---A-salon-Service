import { Request, Response, NextFunction } from "express";
import CustomError from "../Utils/cutsomError";
import { IMessageService } from "../Interfaces/Messages/IMessageService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

interface AuthenticatedRequest extends Request {
  user?: { id: string, role:string };
}

class ChatController {
  private _messageService: IMessageService;
  private _salonService: ISalonService;

  constructor(messageService: IMessageService, salonService: ISalonService) {
    this._messageService = messageService;
    this._salonService = salonService;
  }

  async getUserChats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
      }

      const chats = await this._messageService.getUserChats(userId);
      const salons = await this._salonService.allSalonListForChat();

      res.status(HttpStatus.OK).json({
        message: Messages.USER_CHATS_FETCHED,
        chats,
        salons,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_USER_CHATS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async getSalonChats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const salonId = req.user?.id;
      if (!salonId) {
        throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
      }

      const chats = await this._messageService.getSalonChats(salonId);
      console.log(chats,"chatsss")
      res.status(HttpStatus.OK).json({
        message: Messages.SALON_CHATS_FETCHED,
        chats,
      });
    } catch (error:any) {
      next(new CustomError(error.message || Messages.FETCH_SALON_CHATS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async deleteChat(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
    try {
      const callerId = req.user?.id
      const role = req.user?.role
      const {salonId} =  req.params
     if (!callerId || !salonId || !role) {
        throw new CustomError("Caller ID, Salon ID, and role are required", HttpStatus.BAD_REQUEST);
      }

      if (role !== "User") {
        throw new CustomError("Only users can use this endpoint", HttpStatus.FORBIDDEN);
      }
     await this._messageService.deleteChat(callerId, salonId);
      res.status(HttpStatus.OK).json({message:"Chat deleted Successfully"})
    } catch (error) {
      next(error)
    }
  }

  async deleteSalonChat(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>{
    try {
       const callerId = req.user?.id;
      const role = req.user?.role;
      const { userId } = req.params;
      if (!callerId || !userId || !role) {
        throw new CustomError("Caller ID, User ID, and role are required", HttpStatus.BAD_REQUEST);
      }

      if (role !== "Salon") {
        throw new CustomError("Only salons can use this endpoint", HttpStatus.FORBIDDEN);
      }

      await this._messageService.deleteChat(userId, callerId);
      res.status(HttpStatus.OK).json({ message: "Chat deleted successfully" });
    } catch (error) {
      next(error)
    }
  }
}

export default ChatController;