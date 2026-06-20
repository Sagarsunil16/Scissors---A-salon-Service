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
const HttpStatus_1 = require("../constants/HttpStatus");
const Messages_1 = require("../constants/Messages");
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
class MessageService {
    constructor(messageRepository, chatRepository) {
        this._messageRepository = messageRepository;
        this._chatRepository = chatRepository;
    }
    sendMessage(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { senderId, recipientId, senderType, recipientType, content, image } = messageData;
            if (!senderId || !recipientId || !senderType || !recipientType) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_MESSAGE_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const userId = senderType === "User" ? senderId : recipientId;
            const salonId = senderType === "Salon" ? senderId : recipientId;
            let chat = yield this._chatRepository.findChat(userId, salonId);
            if (!chat) {
                chat = yield this._chatRepository.createChat(userId, salonId);
            }
            const message = yield this._messageRepository.createMessage(Object.assign(Object.assign({}, messageData), { chatId: chat.id, isRead: false }));
            const update = {
                lastMessage: content || "Image",
                lastActive: new Date(),
            };
            if (recipientType === "User") {
                update.unreadCountUser = (chat.unreadCountUser || 0) + 1;
            }
            else if (recipientType === "Salon") {
                update.unreadCountSalon = (chat.unreadCountSalon || 0) + 1;
            }
            yield this._chatRepository.updateChat(chat.id, update);
            return message;
        });
    }
    getChatHistory(userId, salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (!salonId) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_ID_REQUIRED, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const chat = yield this._chatRepository.findChat(userId, salonId);
            if (!chat)
                return [];
            return this._messageRepository.getChatHistory(chat.id);
        });
    }
    getUserChats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const chats = yield this._chatRepository.getUsersChat(userId);
            return chats.map((chat) => ({
                _id: chat._id,
                salonId: chat.salonId,
                lastMessage: chat.lastMessage,
                lastActive: chat.lastActive,
                unreadCount: chat.unreadCountUser || 0,
            }));
        });
    }
    getMessageById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_MESSAGE_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            return yield this._messageRepository.findById(id);
        });
    }
    getSalonChats(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!salonId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const chats = yield this._chatRepository.getSalonsChat(salonId);
            return chats.map((chat) => ({
                _id: chat._id,
                userId: chat.userId,
                lastMessage: chat.lastMessage,
                lastActive: chat.lastActive,
                unreadCount: chat.unreadCountSalon || 0,
            }));
        });
    }
    deleteChat(userId, salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !salonId) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CHAT_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const chat = yield this._chatRepository.findChat(userId, salonId);
            if (!chat)
                throw new cutsomError_1.default(Messages_1.Messages.CHAT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            yield this._messageRepository.deleteMessagesByChat(chat._id);
            yield this._chatRepository.deleteChat(chat._id);
        });
    }
    markMessagesAsRead(userId, salonId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !salonId) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CHAT_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (role !== "User" && role !== "Salon") {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_ROLE, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const chat = yield this._chatRepository.findChat(userId, salonId);
            if (!chat)
                throw new cutsomError_1.default(Messages_1.Messages.CHAT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            const recipientId = role === "User" ? userId : salonId;
            yield this._messageRepository.markMessagesAsRead(chat._id, recipientId);
            const update = {};
            if (role === "User") {
                update.unreadCountUser = 0;
            }
            else if (role === "Salon") {
                update.unreadCountSalon = 0;
            }
            yield this._chatRepository.updateChat(chat._id, update);
        });
    }
    addReaction(messageId, userId, emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (!messageId || !emoji) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_REACTION_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const message = yield this._messageRepository.addReaction(messageId, userId, emoji);
            if (!message) {
                throw new cutsomError_1.default(Messages_1.Messages.MESSAGE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return message;
        });
    }
    uploadAttachment(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!file) {
                throw new cutsomError_1.default(Messages_1.Messages.NO_FILE_UPLOADED, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            return {
                type: file.mimetype.startsWith("image") ? "image" : "file",
                url: `/Uploads/${file.filename}`,
                filename: file.originalname,
                size: file.size,
            };
        });
    }
}
exports.default = MessageService;
