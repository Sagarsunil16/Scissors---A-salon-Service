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
const class_transformer_1 = require("class-transformer");
const user_dto_1 = require("../dto/user.dto");
const class_validator_1 = require("class-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserController {
    constructor(userService) {
        this._userService = userService;
    }
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createUserDto = (0, class_transformer_1.plainToClass)(user_dto_1.CreateUserDto, req.body);
                const errors = yield (0, class_validator_1.validate)(createUserDto);
                if (errors.length > 0) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const newUser = yield this._userService.createUser(createUserDto);
                res.status(HttpStatus_1.HttpStatus.CREATED).json({
                    message: Messages_1.Messages.USER_CREATED,
                    user: newUser,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    userLogin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    throw new cutsomError_1.default(Messages_1.Messages.MISSING_LOGIN_CREDENTIALS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const result = yield this._userService.loginUser(email, password);
                const cookieOptions = {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                };
                res
                    .cookie("authToken", result === null || result === void 0 ? void 0 : result.accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 15 * 60 * 1000 }))
                    .cookie("refreshToken", result === null || result === void 0 ? void 0 : result.refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }))
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({
                    message: Messages_1.Messages.USER_LOGGED_IN,
                    user: result === null || result === void 0 ? void 0 : result.user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    googleLogin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body;
                const result = yield this._userService.googleLogin(token);
                const cookieOptions = {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                };
                res
                    .cookie("authToken", result === null || result === void 0 ? void 0 : result.token, Object.assign(Object.assign({}, cookieOptions), { maxAge: 15 * 60 * 1000 }))
                    .cookie("refreshToken", result === null || result === void 0 ? void 0 : result.refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }))
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({
                    message: Messages_1.Messages.GOOGLE_LOGIN_SUCCESS,
                    user: result === null || result === void 0 ? void 0 : result.user,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    userSignOut(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (refreshToken) {
                    yield this._userService.signOut(refreshToken);
                }
                res
                    .clearCookie("authToken", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" })
                    .clearCookie("refreshToken", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production" })
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({ message: Messages_1.Messages.LOGGED_OUT });
            }
            catch (error) {
                next(error);
            }
        });
    }
    sentOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const message = yield this._userService.sendOtp(email);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message });
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp, purpose } = req.body;
                const isValid = yield this._userService.verifyOTP(email, otp);
                const response = res.status(HttpStatus_1.HttpStatus.OK);
                if (purpose === "password-reset") {
                    const isProduction = process.env.NODE_ENV === "production";
                    const resetPasswordToken = jsonwebtoken_1.default.sign({ email, purpose: "password-reset" }, process.env.JWT_SECRET, { expiresIn: "10m" });
                    response.cookie("resetPasswordToken", resetPasswordToken, {
                        path: "/",
                        httpOnly: true,
                        secure: isProduction,
                        sameSite: isProduction ? "none" : "lax",
                        maxAge: 10 * 60 * 1000,
                    });
                }
                response.json({
                    message: Messages_1.Messages.OTP_VERIFIED,
                    isValid,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const resetPasswordToken = req.cookies.resetPasswordToken;
                if (!resetPasswordToken) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_TOKEN, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const decoded = jsonwebtoken_1.default.verify(resetPasswordToken, process.env.JWT_SECRET);
                if (decoded.email !== email || decoded.purpose !== "password-reset") {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_TOKEN, HttpStatus_1.HttpStatus.UNAUTHORIZED);
                }
                const message = yield this._userService.resetPassword(email, password);
                res
                    .clearCookie("resetPasswordToken", {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                })
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({ message: Messages_1.Messages.PASSWORD_RESET });
            }
            catch (error) {
                if (error instanceof cutsomError_1.default) {
                    next(error);
                    return;
                }
                next(new cutsomError_1.default(error.message || Messages_1.Messages.RESET_PASSWORD_FAILED, HttpStatus_1.HttpStatus.BAD_REQUEST));
            }
        });
    }
    updateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body, "idd");
                const updateUserDto = (0, class_transformer_1.plainToClass)(user_dto_1.UpdateUserDto, req.body);
                console.log(updateUserDto, "dto");
                const errors = yield (0, class_validator_1.validate)(updateUserDto);
                if (errors.length > 0) {
                    console.log("Error here");
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const updatedUser = yield this._userService.updateUser(updateUserDto.id, updateUserDto, false);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.PROFILE_UPDATED,
                    user: updatedUser
                });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.UPDATE_USER_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, currentPassword, newPassword } = req.body;
                yield this._userService.changePassword(id, currentPassword, newPassword);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: Messages_1.Messages.PASSWORD_UPDATED });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.CHANGE_PASSWORD_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
}
exports.default = UserController;
