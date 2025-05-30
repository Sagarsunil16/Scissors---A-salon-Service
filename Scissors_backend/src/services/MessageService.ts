import { HttpStatus } from "../constants/HttpStatus";
import { IChatRepository } from "../Interfaces/Chat/IChatRepository";
import { IMessage, IMessageDocument } from "../Interfaces/Messages/IMessage";
import { IMessageRepository } from "../Interfaces/Messages/IMessageRepository";
import { IMessageService } from "../Interfaces/Messages/IMessageService";
import CustomError from "../Utils/cutsomError";

class MessageService implements IMessageService {
  private _messageRepository: IMessageRepository;
  private _chatRepository: IChatRepository

  constructor(messageRepository: IMessageRepository,chatRepository:IChatRepository) {
    this._messageRepository = messageRepository;
    this._chatRepository = chatRepository
  }

  async sendMessage(messageData: IMessage): Promise<IMessageDocument> {
    const { senderId, recipientId, senderType, recipientType, content, image } = messageData;
    // Determine userId and salonId
    const userId = senderType === "User" ? senderId : recipientId;
    const salonId = senderType === "Salon" ? senderId : recipientId;
     let chat = await this._chatRepository.findChat(userId as string, salonId as string);
    if (!chat) {
      chat = await this._chatRepository.createChat(userId as string, salonId as string);
    }
      const message = await this._messageRepository.createMessage({
        ...messageData,
        chatId:chat.id,
        isRead:false
      });

      // Update chat with lastMessage, lastActive, and appropriate unreadCount
    const update: any = {
      lastMessage: content || "Image",
      lastActive: new Date(),
    };
    if (recipientType === "User") {
      update.unreadCountUser = (chat.unreadCountUser || 0) + 1;
    } else if (recipientType === "Salon") {
      update.unreadCountSalon = (chat.unreadCountSalon || 0) + 1;
    }
    await this._chatRepository.updateChat(chat.id, update);

    return message;
  }

  async getChatHistory(userId: string, salonId: string): Promise<IMessageDocument[]> {
      const chat = await this._chatRepository.findChat(userId,salonId)
      if(!chat) return []
      return this._messageRepository.getChatHistory(chat.id);
  }

  async getUserChats(userId: string): Promise<any[]> {
      const chats = await this._chatRepository.getUsersChat(userId)
      return chats.map((chat)=>({
        _id:chat._id,
        salonId:chat.salonId,
        lastMessage:chat.lastMessage,
        lastActive:chat.lastActive,
        unreadCount: chat.unreadCountUser || 0,
      }))
  }

  async getMessageById(id: string): Promise<IMessageDocument | null> {
      return await this._messageRepository.findById(id)
  }

  async getSalonChats(salonId: string): Promise<any[]> {
      const chats = await this._chatRepository.getSalonsChat(salonId)
      return chats.map((chat)=>({
        _id:chat._id,
        userId:chat.userId,
        lastMessage:chat.lastMessage,
        lastActive:chat.lastActive,
        unreadCount:chat.unreadCountSalon || 0
      }))
  }

  async deleteChat(userId: string, salonId: string): Promise<void> {
    const chat = await this._chatRepository.findChat(userId, salonId);
    if (!chat) throw new CustomError("Chat not found", HttpStatus.NOT_FOUND);
    await this._messageRepository.deleteMessagesByChat(chat._id);
    await this._chatRepository.deleteChat(chat._id);
}

 async markMessagesAsRead(userId: string, salonId: string, role: "User" | "Salon"): Promise<void> {
    const chat = await this._chatRepository.findChat(userId, salonId);
    if (!chat) throw new CustomError("Chat not found", HttpStatus.NOT_FOUND);

    const recipientId = role === "User" ? userId : salonId;
    await this._messageRepository.markMessagesAsRead(chat._id, recipientId);

    // Reset the appropriate unreadCount based on role
    const update: any = {};
    if (role === "User") {
      update.unreadCountUser = 0;
    } else if (role === "Salon") {
      update.unreadCountSalon = 0;
    }
    await this._chatRepository.updateChat(chat._id, update);
  }

  async addReaction(messageId:String,userId:string,emoji:string):Promise<IMessageDocument>{
    return await this._messageRepository.addReaction(messageId as string,userId,emoji)
  }
}

export default MessageService;