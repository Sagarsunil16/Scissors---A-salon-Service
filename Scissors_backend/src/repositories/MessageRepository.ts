import { BaseRepository } from "./BaseRepository";
import { IMessageRepository } from "../Interfaces/Messages/IMessageRepository";
import { IMessage } from "../Interfaces/Messages/IMessage";
import { IMessageDocument } from "../Interfaces/Messages/IMessage";
import Message from "../models/Message";
import CustomError from "../Utils/cutsomError";

// Optional: Define type for aggregation output
interface IChatSummary {
  id: string;
  name: string;
  lastMessage: string;
  lastActive: Date;
  salonId?: string;
  userId?: string;
}

class MessageRepository extends BaseRepository<IMessageDocument> implements IMessageRepository {
  constructor() {
    super(Message);
  }

  async createMessage(message: IMessage): Promise<IMessageDocument> {
    return await this.create(message);
  }

  async getChatHistory(chatId: string): Promise<IMessageDocument[]> {
      return await this.model.find({chatId}).sort({createdAt:1})
  }

  async findById(id: string): Promise<IMessageDocument | null> {
    return await this.findById(id);
  }

  async deleteMessagesByChat(chatId: string): Promise<void> {
      await this.model.deleteMany({chatId})
  }

  async markMessagesAsRead(chatId: string, recipientId: string): Promise<void> {
      await this.model.updateMany({chatId,recipientId:recipientId,isRead:false},
        {$set:{isRead:true}}
      )
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<IMessageDocument> {
      const message =  await this.model.findByIdAndUpdate(messageId,{
        $push:{reactions:{userId,emoji}}
      },{new:true})

      if(!message){
        throw new CustomError("Message not found",404)
      }
      return message
  }

}

export default MessageRepository;