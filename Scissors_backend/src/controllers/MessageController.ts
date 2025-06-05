import { Request, Response, NextFunction } from "express";
import { IMessageService } from "../Interfaces/Messages/IMessageService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

class MessageController {
  private _messageService: IMessageService;

  constructor(messageService: IMessageService) {
    this._messageService = messageService;
  }

  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { salonId } = req.params;
      const messages = await this._messageService.getChatHistory(userId as string, salonId);
      res.status(HttpStatus.OK).json( messages );
    } catch (error) {
      next(error);
    }
  }

  async getSalonMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const salonId = req.user?.id;
      const { userId } = req.params;
      const messages = await this._messageService.getChatHistory(userId, salonId as string);
      res.status(HttpStatus.OK).json(messages );
    } catch (error) {
      next(error);
    }
  }

  async uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const attachment = await this._messageService.uploadAttachment(req.file);
      res.status(HttpStatus.OK).json(attachment);
    } catch (error) {
      next(error);
    }
  }

  async markMessagesAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const { salonId, userId: paramUserId } = req.params;
      const targetUserId = role === "Salon" ? paramUserId : userId;
      const targetSalonId = role === "Salon" ? userId : salonId;
      await this._messageService.markMessagesAsRead(targetUserId as string, targetSalonId as string, role as "User" | "Salon");
      res.status(HttpStatus.OK).json({ message: Messages.MESSAGES_MARKED_READ  });
    } catch (error) {
      next(error);
    }
  }

  async addReaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;
      const { emoji } = req.body;
      const message = await this._messageService.addReaction(messageId, userId as string, emoji);
      res.status(HttpStatus.OK).json( message );
    } catch (error) {
      next(error);
    }
  }
}

export default MessageController;