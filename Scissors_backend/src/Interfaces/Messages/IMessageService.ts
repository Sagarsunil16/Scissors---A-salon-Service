import { IMessage, IMessageDocument } from "./IMessage";

export interface IMessageService {
  sendMessage(messageData: Partial<IMessage>): Promise<IMessageDocument>;
  getChatHistory(userId: string, salonId: string): Promise<IMessageDocument[]>;
  getMessageById(id: string): Promise<IMessageDocument | null>;
  getUserChats(userId: string): Promise<any[]>;
  getSalonChats(salonId: string): Promise<any[]>;
  deleteChat(userId: string, salonId: string): Promise<void>;
  markMessagesAsRead(userId: string, salonId: string, role: "User" | "Salon"): Promise<void>;
  addReaction(messageId: string, userId: string, emoji: string): Promise<IMessageDocument>;
  uploadAttachment(file: Express.Multer.File | undefined): Promise<{
    type: "image" | "file";
    url: string;
    filename: string;
    size: number;
  }>;
}