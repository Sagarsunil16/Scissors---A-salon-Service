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
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
class ChatController {
    constructor(messageService, salonService) {
        this._messageService = messageService;
        this._salonService = salonService;
    }
    getUserChats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const chats = yield this._messageService.getUserChats(userId);
                const salons = yield this._salonService.allSalonListForChat();
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.USER_CHATS_FETCHED,
                    chats,
                    salons,
                });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.FETCH_USER_CHATS_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
    getSalonChats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const salonId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!salonId) {
                    throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const chats = yield this._messageService.getSalonChats(salonId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SALON_CHATS_FETCHED,
                    chats,
                });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.FETCH_SALON_CHATS_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
    deleteChat(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const callerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const { salonId } = req.params;
                if (!callerId || !salonId || !role) {
                    throw new cutsomError_1.default("Caller ID, Salon ID, and role are required", HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                if (role !== "User") {
                    throw new cutsomError_1.default("Only users can use this endpoint", HttpStatus_1.HttpStatus.FORBIDDEN);
                }
                yield this._messageService.deleteChat(callerId, salonId);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: "Chat deleted Successfully" });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteSalonChat(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const callerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const { userId } = req.params;
                if (!callerId || !userId || !role) {
                    throw new cutsomError_1.default("Caller ID, User ID, and role are required", HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                if (role !== "Salon") {
                    throw new cutsomError_1.default("Only salons can use this endpoint", HttpStatus_1.HttpStatus.FORBIDDEN);
                }
                yield this._messageService.deleteChat(userId, callerId);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: "Chat deleted successfully" });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ChatController;
