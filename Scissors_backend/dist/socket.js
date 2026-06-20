"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const di_1 = require("./container/di");
const cloudinary_1 = __importDefault(require("./config/cloudinary"));
const onlineUsers = new Set();
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });
    io.use((socket, next) => {
        const userId = socket.handshake.auth.userId;
        const role = socket.handshake.auth.role;
        if (!userId || !role) {
            return next(new Error("Authentication error: Missing userId or role"));
        }
        socket.data.userId = userId;
        socket.data.role = role;
        next();
    });
    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        const role = socket.data.role;
        console.log(`A ${role} connected: ${userId}`);
        onlineUsers.add(userId);
        io.emit("onlineUsers", Array.from(onlineUsers));
        console.log(`[SERVER] Online users:`, Array.from(onlineUsers));
        socket.on("joinChat", ({ salonId }) => {
            const roomName = [socket.data.userId, salonId].sort().join("-");
            console.log(`[SERVER] ${role} ${socket.data.userId} joining room: ${roomName}`);
            socket.join(roomName);
            io.in(roomName)
                .allSockets()
                .then((sockets) => {
                console.log(`[SERVER] Current members of ${roomName}:`, Array.from(sockets));
            });
        });
        socket.on("sendMessage", (messageData) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { content, senderType, recipientId, recipientType, image } = messageData;
                const senderId = socket.data.userId;
                if (!senderId || !recipientId || !senderType || !recipientType) {
                    throw new Error("Missing required message fields");
                }
                if (role === "User" && senderType !== "User") {
                    throw new Error("User can only send messages as User");
                }
                if (role === "Salon" && senderType !== "Salon") {
                    throw new Error("Salon can only send messages as Salon");
                }
                const normalizedRecipientType = recipientType === "User" ? "User" : "Salon";
                let imageUrl = "";
                if (image) {
                    const uploadResult = yield cloudinary_1.default.uploader.upload(image, {
                        folder: "chat_images",
                        resource_type: "image",
                    });
                    imageUrl = uploadResult.secure_url;
                }
                const newMessage = yield di_1.messageService.sendMessage({
                    content: content || "",
                    senderType: senderType,
                    senderId,
                    recipientId,
                    recipientType: normalizedRecipientType,
                    image: imageUrl,
                    timestamp: new Date().toISOString(),
                });
                const roomName = [senderId, recipientId].sort().join("-");
                socket.join(roomName);
                io.to(roomName).emit("newMessage", newMessage);
                console.log(`[SERVER] Message emitted to ${roomName}`);
            }
            catch (error) {
                console.error("Error handling message:", error.message);
                socket.emit("error", `Failed to send message: ${error.message}`);
            }
        }));
        socket.on("deleteChat", (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, salonId }) {
            try {
                if (role === "User" && socket.data.userId !== userId) {
                    throw new Error("Users can only delete their own chats");
                }
                if (role === "Salon" && socket.data.userId !== salonId) {
                    throw new Error("Salons can only delete their own chats");
                }
                yield di_1.messageService.deleteChat(userId, salonId);
                const roomName = [userId, salonId].sort().join("-");
                io.to(roomName).emit("chatDeleted", { userId, salonId });
                console.log(`[SERVER] Chat deleted for room ${roomName}`);
            }
            catch (error) {
                console.error("Error deleting chat:", error.message);
                socket.emit("error", `Failed to delete chat: ${error.message}`);
            }
        }));
        socket.on("markMessagesAsRead", (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, salonId }) {
            try {
                yield di_1.messageService.markMessagesAsRead(userId, salonId, role);
                const roomName = [userId, salonId].sort().join("-");
                io.to(roomName).emit("messagesRead", { userId, salonId, role });
                console.log(`[SERVER] Messages marked as read by ${role} for room ${roomName}`);
            }
            catch (error) {
                console.error("Error marking messages as read:", error.message);
                socket.emit("error", `Failed to mark messages as read: ${error.message}`);
            }
        }));
        socket.on("addReaction", (_a) => __awaiter(void 0, [_a], void 0, function* ({ messageId, emoji }) {
            try {
                const userId = socket.data.userId;
                const message = yield di_1.messageService.addReaction(messageId, userId, emoji);
                const roomName = [message.senderId, message.recipientId].sort().join("-");
                io.to(roomName).emit("messageReaction", { messageId, reaction: { userId, emoji } });
                console.log(`[SERVER] Reaction added to message ${messageId}`);
            }
            catch (error) {
                console.error("Error adding reaction:", error.message);
                socket.emit("error", `Failed to add reaction: ${error.message}`);
            }
        }));
        socket.on("startVideoCall", ({ recipientId }) => {
            const senderId = socket.data.userId;
            const roomName = [senderId, recipientId].sort().join("-");
            const activeCalls = socket.data.activeCalls || new Set();
            socket.data.activeCalls = activeCalls;
            if (activeCalls.has(roomName)) {
                console.log(`[SERVER] Call already active: ${roomName}`);
                socket.emit("error", "Call already in progress");
                return;
            }
            activeCalls.add(roomName);
            console.log(`[SERVER] Video call initiated by ${senderId} (${role}) to ${recipientId} in room ${roomName}`);
            socket.to(roomName).emit("incomingCall", { callerId: senderId, roomName });
        });
        socket.on("acceptVideoCall", ({ callerId }) => {
            const recipientId = socket.data.userId;
            const roomName = [callerId, recipientId].sort().join("-");
            console.log(`[SERVER] Video call accepted by ${recipientId} (${role}) with ${callerId} in room ${roomName}`);
            io.to(roomName).emit("callAccepted", { callerId, recipientId });
        });
        socket.on("rejectVideoCall", ({ callerId }) => {
            const recipientId = socket.data.userId;
            const roomName = [callerId, recipientId].sort().join("-");
            const activeCalls = socket.data.activeCalls || new Set();
            activeCalls.delete(roomName);
            console.log(`[SERVER] Video call rejected by ${recipientId} (${role})`);
            io.to(roomName).emit("callRejected", { recipientId });
        });
        socket.on("disconnect", () => {
            console.log(`${role} disconnected: ${socket.data.userId}`);
            onlineUsers.delete(userId);
            io.emit("onlineUsers", Array.from(onlineUsers));
            console.log(`[SERVER] Online users:`, Array.from(onlineUsers));
            const activeCalls = socket.data.activeCalls || new Set();
            for (const callKey of activeCalls) {
                if (callKey.includes(socket.data.userId)) {
                    activeCalls.delete(callKey);
                }
            }
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
