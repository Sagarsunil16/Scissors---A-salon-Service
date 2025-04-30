import { Server, Socket } from "socket.io";
import http from "http";
import { messageService } from "./container/di";
import cloudinary from "./config/cloudinary";
import { send } from "vite";


export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket: Socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return next(new Error("Authentication error"));
    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    console.log(`A user connected: ${socket.data.userId}`);

    socket.on("joinChat", ({ salonId }: { salonId: string }) => {

      const roomName = [socket.data.userId,salonId].sort().join("-")
      console.log(`[SERVER] User ${socket.data.userId} joining room: ${roomName}`);
      socket.join(roomName);
      io.in(roomName).allSockets().then(sockets => {
        console.log(`[SERVER] Current members of ${roomName}:`, Array.from(sockets));
      });
    });

    socket.on("sendMessage", async(messageData: any) => {
      try {
        const { content, senderType, recipientId, recipientType, image } = messageData;
        const senderId = socket.data.userId;

        // Validate required fields
        if (!senderId || !recipientId || !senderType || !recipientType) {
          throw new Error("Missing required message fields");
        }

        // Normalize recipientType to match schema
        const normalizedRecipientType = recipientType === "User" ? "User" : "Salon";
        let imageUrl = ""
        if(image){
          const uploadResult = await cloudinary.uploader.upload(image,{
            folder:'chat_images',
            resource_type:'image'
          })

          imageUrl = uploadResult.secure_url
        }
        const newMessage = await messageService.sendMessage({
          content: content || "",
          senderType: senderType as "User" | "Salon",
          senderId,
          recipientId,
          recipientType: normalizedRecipientType as "User" | "Salon",
          image:imageUrl,
          timestamp: new Date().toISOString(),
        });

        const roomName = [senderId,recipientId].sort().join("-")
         socket.join(roomName);
        io.to(roomName).emit("newMessage", newMessage);
        console.log(`[SERVER] Message emitted to ${roomName}`);
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("error", "Failed to send message");
      }
    });
    const activeCalls = new Set<string>();
    socket.on("startVideoCall",({recipientId}:{recipientId:string})=>{
      const senderId = socket.data.userId;
      const roomName = [senderId,recipientId].sort().join("-")
      if (activeCalls.has(roomName)) {
        console.log(`[SERVER] Call already active: ${roomName}`);
        socket.emit("error", "Call already in progress");
        return;
      }
      activeCalls.add(roomName);
      // Emit to recipient only, excluding sender
      console.log(`[SERVER] Video call initiated by ${senderId} to ${recipientId} in room ${roomName}`);
      socket.to(roomName).emit("incomingCall",{callerId:senderId,roomName})
    })

    socket.on("acceptVideoCall",({callerId}:{callerId:string})=>{
      const recipientId = socket.data.userId
      const roomName = [callerId,recipientId].sort().join("-")
      console.log(`[SERVER] video call accepted by ${recipientId} with ${callerId} in room ${roomName}`)
      io.to(roomName).emit("callAccepted",{callerId,recipientId})
    })

    socket.on("rejectVideoCall",({callerId}:{callerId:string})=>{
      const recipientId = socket.data.userId
      const roomName = [callerId,recipientId].sort().join("-")
      activeCalls.delete(roomName);
      console.log(`[SERVER] Video call rejected by ${recipientId}`)
      io.to(roomName).emit("callRejected",{recipientId})
    })

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.userId}`);
      for (const callKey of activeCalls) {
        if (callKey.includes(socket.data.userId)) {
          activeCalls.delete(callKey);
        }
      }
    });
  });

  return io;
};