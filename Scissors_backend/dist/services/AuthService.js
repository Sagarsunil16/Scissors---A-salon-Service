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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
class AuthService {
    constructor(salonService, userService) {
        this._salonService = salonService;
        this._userService = userService;
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken) {
                throw new cutsomError_1.default(Messages_1.Messages.MISSING_REFRESH_TOKEN, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            }
            catch (error) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_REFRESH_TOKEN, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            let entity;
            if (decoded.role === "User" || decoded.role === "Admin") {
                entity = yield this._userService.getUserRawById(decoded.id);
            }
            else if (decoded.role === "Salon") {
                entity = yield this._salonService.findSalonRaw(decoded.id);
            }
            else {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_TOKEN_ROLE, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (!entity) {
                throw new cutsomError_1.default(Messages_1.Messages.ENTITY_NOT_FOUND, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (entity.refreshToken !== refreshToken ||
                !entity.refreshTokenExpiresAt ||
                entity.refreshTokenExpiresAt < new Date()) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_REFRESH_TOKEN, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const newAccessToken = jsonwebtoken_1.default.sign({ id: entity._id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
            return {
                accessToken: newAccessToken,
                entity,
                role: decoded.role,
            };
        });
    }
}
exports.default = AuthService;
