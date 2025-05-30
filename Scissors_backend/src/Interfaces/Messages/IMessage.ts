// src/Interfaces/Messages/IMessage.ts
import mongoose, { Document, ObjectId } from "mongoose";

export interface IMessage {
  chatId:string;
  content: string; // Required in schema unless attachments are present
  senderType: "User" | "Salon";
  senderId: ObjectId | string;
  recipientId: ObjectId | string;
  recipientType: "User" | "Salon";
  timestamp?: string; // Optional, defaulted in schema
  image:string;
  isRead?:boolean;
  reactions?:{userId:string,emoji:string}[];
}

export interface IMessageDocument extends IMessage, Document {
  _id: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}