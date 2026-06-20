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
const BaseRepository_1 = require("./BaseRepository");
const Message_1 = __importDefault(require("../models/Message"));
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
class MessageRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Message_1.default);
    }
    createMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(message);
        });
    }
    getChatHistory(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find({ chatId }).sort({ createdAt: 1 });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findById(id);
        });
    }
    deleteMessagesByChat(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.deleteMany({ chatId });
        });
    }
    markMessagesAsRead(chatId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.updateMany({ chatId, recipientId: recipientId, isRead: false }, { $set: { isRead: true } });
        });
    }
    addReaction(messageId, userId, emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.model.findByIdAndUpdate(messageId, {
                $push: { reactions: { userId, emoji } }
            }, { new: true });
            if (!message) {
                throw new cutsomError_1.default("Message not found", 404);
            }
            return message;
        });
    }
}
exports.default = MessageRepository;
