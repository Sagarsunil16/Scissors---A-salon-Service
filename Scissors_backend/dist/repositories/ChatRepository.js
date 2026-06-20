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
const Chat_1 = __importDefault(require("../models/Chat"));
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const HttpStatus_1 = require("../constants/HttpStatus");
class ChatRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Chat_1.default);
    }
    createChat(userId, salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create({ userId, salonId });
        });
    }
    findChat(userId, salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOne({
                $or: [
                    { userId, salonId },
                    { userId: salonId, salonId: userId }
                ]
            });
        });
    }
    getUsersChat(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find({ userId }).sort({ lastActive: -1 });
        });
    }
    getSalonsChat(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find({ salonId }).populate({ path: 'userId', select: 'firstname email' }).sort({ lastActive: -1 });
        });
    }
    deleteChat(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteById(chatId);
        });
    }
    updateChat(chatId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield this.model.findByIdAndUpdate(chatId, data, { new: true });
            if (!chat)
                throw new cutsomError_1.default("Chat not found", HttpStatus_1.HttpStatus.NOT_FOUND);
            return chat;
        });
    }
}
exports.default = ChatRepository;
