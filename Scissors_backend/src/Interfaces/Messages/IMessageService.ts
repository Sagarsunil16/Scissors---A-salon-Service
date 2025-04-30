import { IMessage, IMessageDocument } from "./IMessage";

export interface IMessageService {
    sendMessage(messageData: IMessage): Promise<IMessageDocument>;
    getChatHistory(userId: string, salonId: string): Promise<IMessageDocument[]>;
    getMessageById(id: string): Promise<IMessageDocument | null>;
    getUserChats(userId: string): Promise<any[]>;
    getSalonChats(salonId: string): Promise<any[]>;
  }