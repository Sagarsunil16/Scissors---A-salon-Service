import { Request, Response, NextFunction } from "express";
import CustomError from "../Utils/cutsomError";
import { messageService } from "../config/di";


interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Populated by verifyToken/authMiddleware
}

class MessageController {
  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id; 
      console.log(req.params,userId,"salonId,userId")
      if (!userId) {
        return next(new CustomError("User ID is required", 400));
      }

      const { salonId, userId: recipientId } = req.params; 
      
      const chatId = salonId || recipientId; 
      if (!chatId) {
        return next(new CustomError("Chat partner ID is required", 400));
      }

      const messages = await messageService.getChatHistory(userId, chatId);
      res.status(200).json(messages);
    } catch (error: any) {
      console.log("Error in getMessagesController:", error);
      return next(new CustomError(error.message || "Internal Server Issues", 500));
    }
  }

  async uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return next(new CustomError("No file uploaded", 400));
      }
      const attachment = {
        type: req.file.mimetype.startsWith("image") ? "image" : "file",
        url: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        size: req.file.size,
      };
      res.status(200).json(attachment);
    } catch (error: any) {
      console.log("Error uploading attachment:", error);
      return next(new CustomError(error.message || "Internal Server Issues", 500));
    }
  }
}

export default new MessageController();