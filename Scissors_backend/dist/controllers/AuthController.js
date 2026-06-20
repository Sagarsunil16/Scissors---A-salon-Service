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
class AuthController {
    constructor(authService) {
        this._authService = authService;
    }
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                const { accessToken } = yield this._authService.refreshToken(refreshToken);
                res
                    .cookie("authToken", accessToken, {
                    path: "/",
                    httpOnly: true,
                    maxAge: 15 * 60 * 1000,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                })
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({ message: Messages_1.Messages.TOKEN_REFRESHED, accessToken });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.TOKEN_REFRESH_FAILED, error.statusCode || HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
}
exports.default = AuthController;
