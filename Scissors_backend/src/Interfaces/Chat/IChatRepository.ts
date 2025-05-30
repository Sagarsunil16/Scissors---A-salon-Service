import { IMessageDocument } from "../Messages/IMessage";
import { IChat, IChatDocument } from "./IChat";

export interface IChatRepository {
    createChat(userId:string,salonId:string):Promise<IChatDocument>;
    findChat(userId:string,salonId:string):Promise<IChatDocument | null>;
    getUsersChat(userId:string):Promise<IChatDocument[]>;
    getSalonsChat(salonId:string):Promise<IChatDocument[]>;
    deleteChat(chatId:string):Promise<void>;
    updateChat(chatId:string,data:Partial<IChat>):Promise<IChatDocument>;
}