"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_1 = require("../Utils/otp");
const firebase_1 = __importStar(require("../config/firebase"));
const crypto_1 = __importDefault(require("crypto"));
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
const mongoose_1 = __importDefault(require("mongoose"));
const user_dto_1 = require("../dto/user.dto");
const class_transformer_1 = require("class-transformer");
class UserService {
    constructor(repository) {
        this._repository = repository;
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, firstname, lastname } = userData;
            if (!email || !password || !firstname || !lastname) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const existingUser = yield this._repository.getUserByEmail(email);
            if (existingUser) {
                throw new cutsomError_1.default(Messages_1.Messages.EMAIL_ALREADY_EXISTS, HttpStatus_1.HttpStatus.CONFLICT);
            }
            userData.password = yield bcryptjs_1.default.hash(userData.password, 10);
            let newUser = yield this._repository.createUser(userData);
            newUser = newUser.toObject();
            return (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                _id: newUser._id.toString(),
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                role: newUser.role,
                is_Active: newUser.is_Active,
                verified: newUser.verified,
                googleLogin: newUser.googleLogin,
            });
        });
    }
    getUserRawById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._repository.getUserRawById(id);
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._repository.getUserById(id);
            if (!user)
                return null;
            return (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                _id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                is_Active: user.is_Active,
                verified: user.verified,
                googleLogin: user.googleLogin,
            });
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._repository.getUserByEmail(email);
            if (!user)
                return null;
            return (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                _id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                is_Active: user.is_Active,
                verified: user.verified,
                googleLogin: user.googleLogin,
            });
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._repository.deleteUser(id);
            if (!user)
                return null;
            return (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                _id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                is_Active: user.is_Active,
                verified: user.verified,
                googleLogin: user.googleLogin,
            });
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CREDENTIALS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const user = yield this._repository.getUserByEmail(email);
            if (!user) {
                throw new cutsomError_1.default(Messages_1.Messages.EMAIL_NOT_FOUND, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (!user.is_Active) {
                throw new cutsomError_1.default(Messages_1.Messages.ACCOUNT_BLOCKED, HttpStatus_1.HttpStatus.FORBIDDEN);
            }
            if (!user.verified) {
                throw new cutsomError_1.default(Messages_1.Messages.ACCOUNT_NOT_VERIFIED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (user.role === "Admin") {
                throw new cutsomError_1.default(Messages_1.Messages.UNAUTHORIZED_ADMIN, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CREDENTIALS, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const accessToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, active: user.is_Active }, process.env.JWT_SECRET, { expiresIn: "15m" });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, active: user.is_Active }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            yield this._repository.updateUser(user._id, {
                refreshToken,
                refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return { user: (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                    _id: user._id.toString(),
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                    is_Active: user.is_Active,
                    verified: user.verified,
                    googleLogin: user.googleLogin,
                }), accessToken, refreshToken };
        });
    }
    adminLogin(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                throw new cutsomError_1.default(Messages_1.Messages.MISSING_LOGIN_CREDENTIALS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const user = yield this._repository.getUserByEmail(email);
            if (!user) {
                throw new cutsomError_1.default(Messages_1.Messages.LOGIN_ERROR, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new cutsomError_1.default(Messages_1.Messages.LOGIN_ERROR, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (user.role !== "Admin") {
                throw new cutsomError_1.default(Messages_1.Messages.UNAUTHORIZED_ADMIN, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const accessToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, active: user.is_Active }, process.env.JWT_SECRET, { expiresIn: "15m" });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, active: user.is_Active }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            yield this._repository.updateUser(user._id, {
                refreshToken,
                refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return { user: (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                    _id: user._id.toString(),
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                    is_Active: user.is_Active,
                    verified: user.verified,
                    googleLogin: user.googleLogin,
                }), accessToken, refreshToken };
        });
    }
    googleLogin(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!idToken) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_TOKEN, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (!firebase_1.isFirebaseConfigured) {
                throw new cutsomError_1.default(Messages_1.Messages.WEBHOOK_SERVER_ERROR, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const decodedToken = yield firebase_1.default.auth().verifyIdToken(idToken);
            const { email, name } = decodedToken;
            if (!email) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_GOOGLE_TOKEN, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const username = name.split(" ");
            let user = yield this._repository.getUserByEmail(email);
            if (user && !user.is_Active) {
                throw new cutsomError_1.default(Messages_1.Messages.ACCOUNT_BLOCKED, HttpStatus_1.HttpStatus.FORBIDDEN);
            }
            const tempPassword = crypto_1.default.randomBytes(16).toString("hex");
            if (!user) {
                user = yield this._repository.createUser({
                    firstname: username[0],
                    lastname: username[1] ? username[1] : " ",
                    email: email,
                    phone: " ",
                    password: tempPassword,
                    verified: true,
                    googleLogin: true,
                    role: "User",
                });
                console.log(user);
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            yield this._repository.updateUser(user._id, {
                refreshToken,
                refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return { user: (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                    _id: user._id.toString(),
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                    is_Active: user.is_Active,
                    verified: user.verified,
                    googleLogin: user.googleLogin,
                }), token, refreshToken };
        });
    }
    signOut(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (refreshToken) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                    if (decoded.role == "User" || decoded.role == "Admin") {
                        const user = yield this._repository.getUserById(decoded.id);
                        if (user) {
                            return yield this._repository.updateUser(user._id, {
                                refreshToken: null,
                                refreshTokenExpiresAt: null,
                            });
                        }
                    }
                }
                catch (error) {
                    console.warn("Invalid refresh token during sign-out:", error);
                }
            }
        });
    }
    sendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_EMAIL, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const user = yield this._repository.getUserByEmail(email);
            if (!user) {
                throw new cutsomError_1.default(Messages_1.Messages.USER_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const otp = (0, otp_1.generateOtp)();
            const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);
            yield this._repository.updateUserOtp(email, otp, otpExpiry);
            yield (0, otp_1.sendOtpEmail)(email, otp);
            return Messages_1.Messages.OTP_SENT;
        });
    }
    getAllUsers(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            let query = {};
            if (search) {
                query.$or = [
                    { firstname: { $regex: search, $options: "i" } },
                    { lastname: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            const { data: users, totalCount: totalUsers } = yield this._repository.getAllUsers(page, limit, query);
            if (!users.length) {
                throw new cutsomError_1.default(Messages_1.Messages.NO_USER_DATA_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const userData = users.map((user) => (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                _id: user._id.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                is_Active: user.is_Active,
                verified: user.verified,
                googleLogin: user.googleLogin,
            }));
            const totalUserPages = Math.ceil(totalUsers / limit);
            return { userData, totalUserPages };
        });
    }
    verifyOTP(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !otp) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_OTP, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const user = yield this._repository.getUserRawByEmail(email);
            if (!user) {
                throw new cutsomError_1.default(Messages_1.Messages.USER_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            if (!user.otp || !user.otpExpiry || user.otp !== otp) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_OTP, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (user.otpExpiry < new Date()) {
                throw new cutsomError_1.default(Messages_1.Messages.OTP_EXPIRED, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            yield this._repository.verifyOtpAndUpdate(email);
            return Messages_1.Messages.OTP_VERIFIED;
        });
    }
    resetPassword(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !newPassword) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const strongPassword = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&]).{8,}/;
            if (!strongPassword.test(newPassword)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const user = yield this._repository.getUserByEmail(email);
            if (!user) {
                throw new cutsomError_1.default(Messages_1.Messages.USER_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            yield this._repository.resetPassword(email, hashedPassword);
            return Messages_1.Messages.PASSWORD_RESET;
        });
    }
    updateUser(id, updatedData, isAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id || !mongoose_1.default.Types.ObjectId.isValid(id) || !updatedData.firstname || !updatedData.lastname || !updatedData.phone) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (isAdmin) {
                if (!updatedData.firstname ||
                    !updatedData.lastname ||
                    !updatedData.phone) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
            }
            else {
                if (!updatedData.firstname ||
                    !updatedData.lastname ||
                    !updatedData.address) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const { areaStreet, city, state, pincode } = updatedData.address;
                if (!areaStreet || !city || !state || !pincode) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_ADDRESS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
            }
            const updatedUser = yield this._repository.updateUser(id, updatedData);
            if (!updatedUser) {
                throw new cutsomError_1.default(Messages_1.Messages.USER_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                _id: updatedUser._id.toString(),
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                role: updatedUser.role,
                is_Active: updatedUser.is_Active,
                verified: updatedUser.verified,
                googleLogin: updatedUser.googleLogin,
            });
        });
    }
    changePassword(id, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id || !mongoose_1.default.Types.ObjectId.isValid(id) || !currentPassword || !newPassword) {
                throw new cutsomError_1.default(Messages_1.Messages.MISSING_PASSWORD_FIELDS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const user = yield this._repository.getUserByIdForAuth(id);
            if (!user) {
                throw new cutsomError_1.default(Messages_1.Messages.USER_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CURRENT_PASSWORD, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            yield this._repository.changePassword(id, hashedPassword);
            return Messages_1.Messages.PASSWORD_UPDATED;
        });
    }
    updateUserStatus(id, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield this._repository.updateUserStatus(id, isActive);
            if (!user)
                return null;
            return (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                _id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                is_Active: user.is_Active,
                verified: user.verified,
                googleLogin: user.googleLogin,
            });
        });
    }
    updateRefreshToken(id, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield this._repository.updateRefreshToken(id, refreshToken);
            if (!user)
                return null;
            return (0, class_transformer_1.plainToClass)(user_dto_1.UserDto, {
                _id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString(),
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                is_Active: user.is_Active,
                verified: user.verified,
                googleLogin: user.googleLogin,
            });
        });
    }
}
exports.default = UserService;
