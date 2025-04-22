import mongoose from "mongoose";
import { IMessageRepository } from "../Interfaces/Messages/IMessageRepository";
import { IMessage, IMessageDocument } from "../Interfaces/Messages/IMessage";
import Message from "../models/Message";

class MessageRepository implements IMessageRepository {
  async create(message: IMessage): Promise<IMessageDocument> {
    const newMessage = new Message(message);
    return newMessage.save();
  }

  async getChatHistory(userId: string, salonId: string): Promise<IMessageDocument[]> {
    return await Message.find({
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
    return await Message.findById(id).exec();
  }

  async getUserChats(userId: string): Promise<any[]> {
    return await Message.aggregate([
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
    ]).exec();
  }

  async getSalonChats(salonId: string): Promise<any[]> {
    return await Message.aggregate([
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
    ]).exec();
  }
}

export default MessageRepository;