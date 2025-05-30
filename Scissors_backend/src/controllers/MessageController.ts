import { Request, Response, NextFunction } from "express";
import CustomError from "../Utils/cutsomError";
import { IMessageService } from "../Interfaces/Messages/IMessageService";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";

interface AuthenticatedRequest extends Request {
  user?: { id: string,role:string };
}

class MessageController {
  private _messageService: IMessageService;

  constructor(messageService: IMessageService) {
    this._messageService = messageService;
  }

  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
      }

      const { salonId } = req.params;
       console.log(salonId,userId,"SALON AND USER ID")
      if (!salonId) {
        throw new CustomError(Messages.MISSING_USER_ID, HttpStatus.BAD_REQUEST);
      }
     
      const messages = await this._messageService.getChatHistory(userId, salonId);
      res.status(HttpStatus.OK).json(messages);
    } catch (error: any) {
      next(error);
    }
  }

  async getSalonMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const salonId = req.user?.id; // or req.user?.salonId
      if (!salonId) {
        throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
      }

      const { userId } = req.params;
      if (!userId) {
        throw new CustomError("User ID is required", HttpStatus.BAD_REQUEST);
      }

      const messages = await this._messageService.getChatHistory(userId, salonId);
      res.status(HttpStatus.OK).json(messages);
    } catch (error: any) {
      next(error);
    }
  }

  async uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new CustomError(Messages.NO_FILE_UPLOADED, HttpStatus.BAD_REQUEST);
      }
      const attachment = {
        type: req.file.mimetype.startsWith("image") ? "image" : "file",
        url: `/Uploads/${req.file.filename}`,
        filename: req.file.originalname,
        size: req.file.size,
      };
      res.status(HttpStatus.OK).json(attachment);
    } catch (error: any) {
      next(error);
    }
  }

  async markMessagesAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
       const role = req.user?.role
      const { salonId } = req.params;
      if (!userId || !salonId) {
        throw new CustomError(Messages.MISSING_USER_ID, HttpStatus.BAD_REQUEST);
      }

      await this._messageService.markMessagesAsRead(userId, salonId , role as string);
      res.status(HttpStatus.OK).json({ message: "Messages marked as Read" });
    } catch (error: any) {
      next(error);
    }
  }

  async markSalonMessagesAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const salonId = req.user?.id;
     const role = req.user?.role;
    if (!salonId) {
      throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const { userId } = req.params;
    if (!userId) {
      throw new CustomError("User ID is required", HttpStatus.BAD_REQUEST);
    }

    await this._messageService.markMessagesAsRead(userId, salonId, role as string);
    res.status(HttpStatus.OK).json({ message: "Messages marked as read" });
  } catch (error: any) {
    next(error);
  }
}

  async addReaction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;
      const { emoji } = req.body;
      if (!userId || !messageId || !emoji) {
        throw new CustomError("All fields are required", HttpStatus.BAD_REQUEST);
      }

      const message = await this._messageService.addReaction(messageId, userId, emoji);
      res.status(HttpStatus.OK).json(message);
    } catch (error: any) {
      next(error);
    }
  }
}

export default MessageController;