import { IChat, IChatDocument } from "../Interfaces/Chat/IChat";
import { IChatRepository } from "../Interfaces/Chat/IChatRepository";
import { BaseRepository } from "./BaseRepository";
import Chat from "../models/Chat";
import CustomError from "../Utils/cutsomError";
import { HttpStatus } from "../constants/HttpStatus";


class ChatRepository extends BaseRepository<IChatDocument> implements IChatRepository{
    constructor(){
        super(Chat)
    }
    async createChat(userId: string, salonId: string): Promise<IChatDocument> {
        return await this.create({userId,salonId})
    }
    async findChat(userId: string, salonId: string): Promise<IChatDocument | null> {
        return await this.findOne({
            $or:[
                {userId,salonId},
                {userId:salonId,salonId:userId}
            ]
        })
    }
    async getUsersChat(userId: string): Promise<IChatDocument[]> {
        return await this.model.find({userId}).sort({lastActive: -1});
    }

    async getSalonsChat(salonId: string): Promise<IChatDocument[]> {
        return await this.model.find({salonId}).populate({ path: 'userId', select: 'firstname email' }).sort({lastActive:-1})
    }

    async deleteChat(chatId: string): Promise<void> {
        await this.deleteById(chatId)
    }

    async updateChat(chatId: string, data: Partial<IChat>): Promise<IChatDocument> {
        const chat = await this.model.findByIdAndUpdate(chatId,data,{new:true});
        if(!chat) throw new CustomError("Chat not found",HttpStatus.NOT_FOUND);
        return chat
    }
}


export default ChatRepository