import mongoose from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { IMessageRepository } from "../Interfaces/Messages/IMessageRepository";
import { IMessage } from "../Interfaces/Messages/IMessage";
import { IMessageDocument } from "../Interfaces/Messages/IMessage";
import Message from "../models/Message";

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

  async create(message: IMessage): Promise<IMessageDocument> {
    return await this.create(message);
  }

  async getChatHistory(userId: string, salonId: string): Promise<IMessageDocument[]> {
    return await this.model
      .find({
        $or: [
          { senderId: userId, recipientId: salonId },
          { senderId: salonId, recipientId: userId },
        ],
      })
      .sort({ createdAt: 1 })
      .populate("senderId", "firstname lastname salonName")
      .populate("recipientId", "firstname lastname salonName")
      .exec();
  }

  async findById(id: string): Promise<IMessageDocument | null> {
    return await this.findById(id);
  }

  async getUserChats(userId: string): Promise<IChatSummary[]> {
    return await this.model
      .aggregate([
        {
          $match: {
            $or: [
              { senderId: new mongoose.Types.ObjectId(userId) },
              { recipientId: new mongoose.Types.ObjectId(userId) },
            ],
          },
        },
        {
          $group: {
            _id: {
              $cond: [{ $eq: ["$senderType", "user"] }, "$recipientId", "$senderId"],
            },
            lastMessage: { $last: "$content" },
            lastActive: { $last: "$timestamp" },
          },
        },
        {
          $lookup: {
            from: "salons",
            localField: "_id",
            foreignField: "_id",
            as: "salon",
          },
        },
        {
          $unwind: "$salon",
        },
        {
          $project: {
            id: "$_id",
            name: "$salon.salonName",
            lastMessage: 1,
            lastActive: 1,
            salonId: "$_id",
          },
        },
      ])
      .exec();
  }

  async getSalonChats(salonId: string): Promise<IChatSummary[]> {
    return await this.model
      .aggregate([
        {
          $match: {
            $or: [
              { senderId: new mongoose.Types.ObjectId(salonId) },
              { recipientId: new mongoose.Types.ObjectId(salonId) },
            ],
          },
        },
        {
          $group: {
            _id: {
              $cond: [{ $eq: ["$senderType", "salon"] }, "$recipientId", "$senderId"],
            },
            lastMessage: { $last: "$content" },
            lastActive: { $last: "$timestamp" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            id: "$_id",
            name: { $concat: ["$user.firstname", " ", "$user.lastname"] },
            lastMessage: 1,
            lastActive: 1,
            userId: "$_id",
          },
        },
      ])
      .exec();
  }
}

export default MessageRepository;