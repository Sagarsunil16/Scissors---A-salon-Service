import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";
import { IChatRepository } from "../Interfaces/Chat/IChatRepository";
import { IMessage, IMessageDocument } from "../Interfaces/Messages/IMessage";
import { IMessageRepository } from "../Interfaces/Messages/IMessageRepository";
import { IMessageService } from "../Interfaces/Messages/IMessageService";
import CustomError from "../Utils/cutsomError";

class MessageService implements IMessageService {
  private _messageRepository: IMessageRepository;
  private _chatRepository: IChatRepository;

  constructor(messageRepository: IMessageRepository, chatRepository: IChatRepository) {
    this._messageRepository = messageRepository;
    this._chatRepository = chatRepository;
  }

  async sendMessage(messageData: IMessage): Promise<IMessageDocument> {
    const { senderId, recipientId, senderType, recipientType, content, image } = messageData;
    if (!senderId || !recipientId || !senderType || !recipientType) {
      throw new CustomError(Messages.INVALID_MESSAGE_DATA, HttpStatus.BAD_REQUEST);
    }

    const userId = senderType === "User" ? senderId : recipientId;
    const salonId = senderType === "Salon" ? senderId : recipientId;
    let chat = await this._chatRepository.findChat(userId as string, salonId as string);
    if (!chat) {
      chat = await this._chatRepository.createChat(userId as string, salonId as string);
    }

    const message = await this._messageRepository.createMessage({
      ...messageData,
      chatId: chat.id,
      isRead: false,
    });

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
    if (!userId) {
      throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
    }
    if (!salonId) {
      throw new CustomError(Messages.SALON_ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const chat = await this._chatRepository.findChat(userId, salonId);
    if (!chat) return [];
    return this._messageRepository.getChatHistory(chat.id);
  }

  async getUserChats(userId: string): Promise<any[]> {
    if (!userId) {
      throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const chats = await this._chatRepository.getUsersChat(userId);
    return chats.map((chat) => ({
      _id: chat._id,
      salonId: chat.salonId,
      lastMessage: chat.lastMessage,
      lastActive: chat.lastActive,
      unreadCount: chat.unreadCountUser || 0,
    }));
  }

  async getMessageById(id: string): Promise<IMessageDocument | null> {
    if (!id) {
      throw new CustomError(Messages.INVALID_MESSAGE_ID, HttpStatus.BAD_REQUEST);
    }
    return await this._messageRepository.findById(id);
  }

  async getSalonChats(salonId: string): Promise<any[]> {
    if (!salonId) {
      throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
    }

    const chats = await this._chatRepository.getSalonsChat(salonId);
    return chats.map((chat) => ({
      _id: chat._id,
      userId: chat.userId,
      lastMessage: chat.lastMessage,
      lastActive: chat.lastActive,
      unreadCount: chat.unreadCountSalon || 0,
    }));
  }

  async deleteChat(userId: string, salonId: string): Promise<void> {
    if (!userId || !salonId) {
      throw new CustomError(Messages.INVALID_CHAT_DATA, HttpStatus.BAD_REQUEST);
    }

    const chat = await this._chatRepository.findChat(userId, salonId);
    if (!chat) throw new CustomError(Messages.CHAT_NOT_FOUND, HttpStatus.NOT_FOUND);
    await this._messageRepository.deleteMessagesByChat(chat._id);
    await this._chatRepository.deleteChat(chat._id);
  }

  async markMessagesAsRead(userId: string, salonId: string, role: "User" | "Salon"): Promise<void> {
    if (!userId || !salonId) {
      throw new CustomError(Messages.INVALID_CHAT_DATA, HttpStatus.BAD_REQUEST);
    }
    if (role !== "User" && role !== "Salon") {
      throw new CustomError(Messages.INVALID_ROLE, HttpStatus.BAD_REQUEST);
    }

    const chat = await this._chatRepository.findChat(userId, salonId);
    if (!chat) throw new CustomError(Messages.CHAT_NOT_FOUND, HttpStatus.NOT_FOUND);

    const recipientId = role === "User" ? userId : salonId;
    await this._messageRepository.markMessagesAsRead(chat._id, recipientId);

    const update: any = {};
    if (role === "User") {
      update.unreadCountUser = 0;
    } else if (role === "Salon") {
      update.unreadCountSalon = 0;
    }
    await this._chatRepository.updateChat(chat._id, update);
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<IMessageDocument> {
    if (!userId) {
      throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HttpStatus.UNAUTHORIZED);
    }
    if (!messageId || !emoji) {
      throw new CustomError(Messages.INVALID_REACTION_DATA, HttpStatus.BAD_REQUEST);
    }

    const message = await this._messageRepository.addReaction(messageId, userId, emoji);
    if (!message) {
      throw new CustomError(Messages.MESSAGE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return message;
  }

  async uploadAttachment(file: Express.Multer.File | undefined): Promise<{
    type: "image" | "file";
    url: string;
    filename: string;
    size: number;
  }> {
    if (!file) {
      throw new CustomError(Messages.NO_FILE_UPLOADED, HttpStatus.BAD_REQUEST);
    }

    return {
      type: file.mimetype.startsWith("image") ? "image" : "file",
      url: `/Uploads/${file.filename}`,
      filename: file.originalname,
      size: file.size,
    };
  }
}

export default MessageService;