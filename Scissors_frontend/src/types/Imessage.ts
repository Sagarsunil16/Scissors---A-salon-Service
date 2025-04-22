

export interface IMessage {
  _id: string;
  content: string;
  image:string;
  senderType: "User" | "Salon";
  senderId:string;
  recipientId: string;
  recipientType: "User" | "Salon";
  timestamp: string;
  attachments?: {
    type: "image" | "file";
    url: string;
    filename: string;
    size: number;
  }[];
}

export interface Chat {
  id: string;
  name: string;
  image:string,
  images:{url:string}[];
  lastMessage: string;
  lastActive: string;
  salonId?: string; // For user side
  userId?: string;  // For salon side
  messages: IMessage[];
}