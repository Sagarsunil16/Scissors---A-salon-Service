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
Object.defineProperty(exports, "__esModule", { value: true });
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
class MessageController {
    constructor(messageService) {
        this._messageService = messageService;
    }
    getMessages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { salonId } = req.params;
                const messages = yield this._messageService.getChatHistory(userId, salonId);
                res.status(HttpStatus_1.HttpStatus.OK).json(messages);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSalonMessages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const salonId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { userId } = req.params;
                const messages = yield this._messageService.getChatHistory(userId, salonId);
                res.status(HttpStatus_1.HttpStatus.OK).json(messages);
            }
            catch (error) {
                next(error);
            }
        });
    }
    uploadAttachment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const attachment = yield this._messageService.uploadAttachment(req.file);
                res.status(HttpStatus_1.HttpStatus.OK).json(attachment);
            }
            catch (error) {
                next(error);
            }
        });
    }
    markMessagesAsRead(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const { salonId, userId: paramUserId } = req.params;
                const targetUserId = role === "Salon" ? paramUserId : userId;
                const targetSalonId = role === "Salon" ? userId : salonId;
                yield this._messageService.markMessagesAsRead(targetUserId, targetSalonId, role);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: Messages_1.Messages.MESSAGES_MARKED_READ });
            }
            catch (error) {
                next(error);
            }
        });
    }
    addReaction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { messageId } = req.params;
                const { emoji } = req.body;
                const message = yield this._messageService.addReaction(messageId, userId, emoji);
                res.status(HttpStatus_1.HttpStatus.OK).json(message);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = MessageController;
