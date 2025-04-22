import { IMessage, IMessageDocument } from "./IMessage";

export interface IMessageRepository{
    create(message:IMessage):Promise<IMessageDocument>;
    getChatHistory(userId:string,salonId:string):Promise<IMessageDocument[]>;
    findById(id:string):Promise<IMessageDocument | null>
    getUserChats(userId:string):Promise<any[]>
    getSalonChats(salonId:string):Promise<any[]>
}