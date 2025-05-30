

export interface IMessage {
  _id: string;
  chatId: string;
  content: string;
  senderId: string;
  senderType: "User" | "Salon";
  recipientId: string;
  recipientType: "User" | "Salon";
  image?: string;
  timestamp: string;
  isRead?: boolean;
  reactions?: { userId: string; emoji: string }[];
}

export interface Chat {
  id: string;
  userId?: string;
  salonId?: string;
  name: string;
  image?: string;
  lastMessage: string;
  lastActive: string;
  messages?: IMessage[];
  unreadCount?: number;
  avatar:string
}