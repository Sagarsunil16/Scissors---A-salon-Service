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
class AdminController {
    constructor(userService, salonService) {
        this._userService = userService;
        this._salonService = salonService;
    }
    adminLogin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { user, accessToken, refreshToken } = yield this._userService.adminLogin(email, password);
                const isProduction = process.env.NODE_ENV === "production";
                const cookieOptions = {
                    path: "/",
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? "none" : "lax",
                    maxAge: 0,
                };
                res
                    .cookie("authToken", accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 15 * 60 * 1000 }))
                    .cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }))
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({
                    message: Messages_1.Messages.LOGIN_SUCCESS,
                    user: user
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, firstname, lastname, phone } = req.body;
                if (!id || !firstname || !lastname || !phone) {
                    throw new cutsomError_1.default(Messages_1.Messages.MISSING_PROFILE_FIELDS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const updatedData = { firstname, lastname, phone };
                const updatedAdmin = yield this._userService.updateUser(id, updatedData, true);
                if (!updatedAdmin) {
                    throw new cutsomError_1.default(Messages_1.Messages.ADMIN_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
                }
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.PROFILE_UPDATED,
                    updatedAdmin,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, currentPassword, newPassword } = req.body;
                if (!id || !currentPassword || !newPassword) {
                    throw new cutsomError_1.default(Messages_1.Messages.MISSING_PASSWORD_FIELDS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                yield this._userService.changePassword(id, currentPassword, newPassword);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.PASSWORD_UPDATED,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    blockUnblockUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, isActive } = req.body;
                if (!userId || isActive === undefined) {
                    throw new cutsomError_1.default(Messages_1.Messages.MISSING_USER_STATUS_FIELDS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const updatedUser = yield this._userService.updateUserStatus(userId, isActive);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.USER_STATUS_UPDATED,
                    updatedUser,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                if (!id) {
                    throw new cutsomError_1.default(Messages_1.Messages.MISSING_USER_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const deletedUser = yield this._userService.deleteUser(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.USER_DELETED,
                    deletedUser,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", limit = "10", search = "" } = req.query;
                const pageNumber = Number(page);
                const limitNumber = Number(limit);
                const { userData, totalUserPages } = yield this._userService.getAllUsers(pageNumber, limitNumber, search);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.USER_DATA_FETCHED,
                    userData: { userData, totalUserPages },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSalons(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", search = "" } = req.query;
                const pageNumber = Number(page);
                const { salonData, totalPages } = yield this._salonService.getAllSalons(pageNumber, search);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SALON_DATA_FETCHED_ADMIN,
                    salonData,
                    totalPages,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    blockAndUnblockSalon(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { salonId, isActive } = req.body;
                if (!salonId || isActive === undefined) {
                    throw new cutsomError_1.default(Messages_1.Messages.MISSING_SALON_STATUS_FIELDS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const updatedSalon = yield this._salonService.updateSalonStatus(salonId, isActive);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SALON_STATUS_UPDATED,
                    updatedSalon,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    signOut(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                if (refreshToken) {
                    yield this._userService.signOut(refreshToken);
                }
                res
                    .clearCookie("authToken", { path: "/", httpOnly: true, secure: false })
                    .clearCookie("refreshToken", { path: "/", httpOnly: true, secure: false })
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({
                    message: Messages_1.Messages.LOGGED_OUT,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AdminController;
