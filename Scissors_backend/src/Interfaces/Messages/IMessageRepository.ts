import { IMessage, IMessageDocument } from "./IMessage";

export interface IMessageRepository{
    createMessage(messageData: IMessage): Promise<IMessageDocument>;
    getChatHistory(chatId: string): Promise<IMessageDocument[]>;
    findById(id: string): Promise<IMessageDocument | null>;
    deleteMessagesByChat(chatId: string): Promise<void>;
    markMessagesAsRead(chatId: string, recipientId: string): Promise<void>;
    addReaction(messageId: string, userId: string, emoji: string): Promise<IMessageDocument>;
}