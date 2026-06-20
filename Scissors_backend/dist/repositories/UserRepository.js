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
const User_1 = __importDefault(require("../models/User"));
const BaseRepository_1 = require("./BaseRepository");
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(User_1.default);
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.create(userData);
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt').lean().exec();
        });
    }
    getUserRawById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id).lean();
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ email }).select('-otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
                .lean()
                .exec();
        });
    }
    getUserRawByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ email: email }).lean();
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndDelete(id).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
                .lean()
                .exec();
        });
    }
    updateUserOtp(email, otp, otpExpiry) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOneAndUpdate({ email }, { otp, otpExpiry });
        });
    }
    updateUserStatus(id, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, { is_Active: isActive }, { new: true }).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
                .lean()
                .exec();
        });
    }
    resetPassword(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOneAndUpdate({ email }, { password: newPassword, otp: null, otpExpiry: null });
        });
    }
    getUserByIdForAuth(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findById(id)
                .select('password')
                .lean()
                .exec();
        });
    }
    verifyOtpAndUpdate(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOneAndUpdate({ email }, { otp: null, otpExpiry: null, verified: true });
        });
    }
    updateUser(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, updateData, { new: true }).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
                .lean()
                .exec();
            ;
        });
    }
    changePassword(id, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, { password: newPassword }, { new: true }).select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
                .lean()
                .exec();
            ;
        });
    }
    getAllUsers(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const finalQuery = Object.assign(Object.assign({}, query), { role: 'User' });
            const skip = (page - 1) * limit;
            const data = yield this.model
                .find(finalQuery)
                .select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();
            const totalCount = yield this.model.countDocuments(finalQuery);
            return { data, totalCount };
        });
    }
    updateRefreshToken(id, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findByIdAndUpdate(id, { refreshToken }, { new: true })
                .select('-password -otp -otpExpiry -refreshToken -refreshTokenExpiresAt')
                .lean()
                .exec();
        });
    }
    countActiveUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments({ role: "User", is_Active: true });
        });
    }
}
exports.default = UserRepository;
