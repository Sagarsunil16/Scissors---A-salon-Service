import { Document } from "mongoose"
export interface IChat {
    userId:string,
    salonId:string,
    lastMessage:string,
    lastActive:Date,
    unreadCountUser: number;
    unreadCountSalon: number;
}


export interface IChatDocument extends IChat, Document{
    _id:string
}