import { IMessage, IMessageDocument } from "../Interfaces/Messages/IMessage";
import { IMessageRepository } from "../Interfaces/Messages/IMessageRepository";

class MessageService {
  private repository: IMessageRepository;

  constructor(repository: IMessageRepository) {
    this.repository = repository;
  }

  async sendMessage(messageData: IMessage): Promise<IMessageDocument> {
    return await this.repository.create(messageData);
  }

  async getChatHistory(userId: string, salonId: string): Promise<IMessageDocument[]> {
    return await this.repository.getChatHistory(userId, salonId);
  }

  async getMessageById(id: string): Promise<IMessageDocument | null> {
    return await this.repository.findById(id);
  }

  async getUserChats(userId: string): Promise<any[]> {
    return await this.repository.getUserChats(userId);
  }

  async getSalonChats(salonId: string): Promise<any[]> {
    return await this.repository.getSalonChats(salonId);
  }
}

export default MessageService;