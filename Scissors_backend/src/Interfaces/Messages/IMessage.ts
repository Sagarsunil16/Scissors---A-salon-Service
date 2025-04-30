// src/Interfaces/Messages/IMessage.ts
import { Document, ObjectId } from "mongoose";

export interface IMessage {
  content: string; // Required in schema unless attachments are present
  senderType: "User" | "Salon";
  senderId: ObjectId | string;
  recipientId: ObjectId | string;
  recipientType: "User" | "Salon";
  timestamp?: string; // Optional, defaulted in schema
  image:string
}

export interface IMessageDocument extends IMessage, Document {
  _id: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}