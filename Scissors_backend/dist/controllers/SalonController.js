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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../Utils/logger"));
class SalonController {
    constructor(salonService) {
        this._salonService = salonService;
    }
    createSalon(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { salonName, email, phone, address, category } = req.body;
                if (!salonName || !email || !phone || !address || !category) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_SALON_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const newSalon = yield this._salonService.createSalon(req.body);
                res.status(HttpStatus_1.HttpStatus.CREATED).json({
                    message: Messages_1.Messages.SALON_REGISTERED,
                    salon: {
                        _id: newSalon._id,
                        salonName: newSalon.salonName,
                        email: newSalon.email,
                        phone: newSalon.phone,
                        address: newSalon.address,
                        category: newSalon.category,
                        openingTime: newSalon.openingTime,
                        closingTime: newSalon.closingTime,
                        rating: newSalon.rating,
                    },
                });
            }
            catch (error) {
                logger_1.default.error(`loginSalon Error: ${error}`);
                next(error);
            }
        });
    }
    sendOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_EMAIL, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const message = yield this._salonService.sendOtp(email);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message });
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyOtpAndUpdate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                if (!email || !otp) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_OTP, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const message = yield this._salonService.verifyOtp(email, otp);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message });
            }
            catch (error) {
                next(error);
            }
        });
    }
    loginSalon(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body, "asdasda");
                const { email, password } = req.body;
                if (!email || !password) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_CREDENTIALS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const result = yield this._salonService.loginSalon(req.body);
                console.log(result, "login result");
                const isProduction = process.env.NODE_ENV === "production";
                const cookieOptions = {
                    path: "/",
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? "none" : "lax",
                };
                res
                    .cookie("authToken", result === null || result === void 0 ? void 0 : result.accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 15 * 60 * 1000 }))
                    .cookie("refreshToken", result.refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }))
                    .status(HttpStatus_1.HttpStatus.OK)
                    .json({ message: Messages_1.Messages.LOGIN_SUCCESS, details: result === null || result === void 0 ? void 0 : result.salon });
            }
            catch (error) {
                next(error);
            }
        });
    }
    signOutSalon(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                yield this._salonService.signOut(refreshToken);
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
    getAllSalons(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search, location, maxPrice, ratings, offers, page = "1", itemsPerPage = "6" } = req.query;
                const pageNumber = parseInt(page, 10) || 1;
                const itemsPerPageNumber = parseInt(itemsPerPage, 10) || 6;
                if (pageNumber < 1 || itemsPerPageNumber < 1) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const { salons, total, totalPages } = yield this._salonService.getFilteredSalons({
                    search: search === null || search === void 0 ? void 0 : search.toString(),
                    location: location === null || location === void 0 ? void 0 : location.toString(),
                    maxPrice: maxPrice ? Number(maxPrice) : undefined,
                    ratings: ratings ? ratings.split(",").map(Number).filter(n => n >= 1 && n <= 5) : [],
                    offers: offers === null || offers === void 0 ? void 0 : offers.toString(),
                }, pageNumber, itemsPerPageNumber);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    success: true,
                    data: {
                        salons,
                        pagination: {
                            currentPage: pageNumber,
                            totalPages,
                            totalItems: total,
                            itemsPerPage: itemsPerPageNumber,
                        },
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getNearbySalons(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { longitude, latitude, radius = 5000, search = "", pincode = "", maxPrice = 100000, ratings = "", discount = "", page = 1, limit = 6, sort = "rating_desc" } = req.query;
                const params = {
                    longitude: longitude ? parseFloat(longitude) : undefined,
                    latitude: latitude ? parseFloat(latitude) : undefined,
                    radius: parseInt(radius) || 5000,
                    search: search,
                    pincode: pincode,
                    maxPrice: parseFloat(maxPrice) || 100000,
                    ratings: ratings ? ratings.split(",").map(Number).filter(n => n >= 1 && n <= 5) : [],
                    discount: parseFloat(discount) || 0,
                    page: parseInt(page) || 1,
                    limit: parseInt(limit) || 6,
                    sort: sort,
                };
                // if (!params.longitude || !params.latitude) {
                //   throw new CustomError(Messages.INVALID_SALON_DATA, HttpStatus.BAD_REQUEST);
                // }
                const result = yield this._salonService.getNearbySalons(params);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.NEARBY_SALONS_RETRIEVED,
                    salons: result.salons,
                    paginations: {
                        currentPage: params.page,
                        totalPages: result.totalPages,
                        totalSalons: result.totalSalons,
                        limit: params.limit,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSalonData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.query.id;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new cutsomError_1.default(Messages_1.Messages.SALON_ID_REQUIRED, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const result = yield this._salonService.getSalonData(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SALON_DATA_FETCHED,
                    salonData: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateSalon(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const { id } = req.body;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_SALON_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const updatedData = yield this._salonService.salonProfileUpdate(req.body);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.PROFILE_UPDATED,
                    updatedData,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    uploadImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { salonId } = req.body;
                const file = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
                if (!salonId || !mongoose_1.default.Types.ObjectId.isValid(salonId)) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_SALON_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                if (!file) {
                    throw new cutsomError_1.default(Messages_1.Messages.NO_FILE_UPLOADED, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const result = yield this._salonService.uploadSalonImage(salonId, file);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.IMAGE_UPLOADED,
                    updatedSalonData: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { salonId, imageId, cloudinaryImageId } = req.body;
                if (!salonId || !imageId || !mongoose_1.default.Types.ObjectId.isValid(salonId) || !mongoose_1.default.Types.ObjectId.isValid(imageId)) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_IMAGE_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const result = yield this._salonService.deleteSalonImage(salonId, imageId, cloudinaryImageId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.IMAGE_DELETED,
                    updatedSalonData: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    addService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.body, { salonId } = _a, serviceData = __rest(_a, ["salonId"]);
                console.log("we have entered");
                console.log(req.body);
                if (!salonId || !mongoose_1.default.Types.ObjectId.isValid(salonId) || !serviceData.name || !serviceData.price || !serviceData.duration) {
                    console.log("we entered here");
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const result = yield this._salonService.addService(req.body);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SERVICE_ADDED,
                    updatedSalonData: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requiredFields = ["salonId", "serviceId", "name", "description", "price", "service", "duration", "stylists"];
                const missingFields = requiredFields.filter(field => !req.body[field]);
                if (missingFields.length > 0) {
                    throw new cutsomError_1.default(`Missing fields: ${missingFields.join(", ")}`, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                if (!mongoose_1.default.Types.ObjectId.isValid(req.body.salonId) || !mongoose_1.default.Types.ObjectId.isValid(req.body.serviceId)) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const data = Object.assign(Object.assign({}, req.body), { price: Number(req.body.price), duration: Number(req.body.duration), stylists: Array.isArray(req.body.stylists) ? req.body.stylists : [] });
                const result = yield this._salonService.updateService(data);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SERVICE_UPDATED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { salonId, serviceId } = req.body;
                if (!salonId || !serviceId || !mongoose_1.default.Types.ObjectId.isValid(salonId) || !mongoose_1.default.Types.ObjectId.isValid(serviceId)) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const result = yield this._salonService.removeService(salonId, serviceId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SERVICE_DELETED,
                    updatedSalonData: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = SalonController;
