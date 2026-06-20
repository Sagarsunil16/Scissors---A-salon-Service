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
const otp_1 = require("../Utils/otp");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const mongoose_1 = __importDefault(require("mongoose"));
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../constants");
const Offer_1 = __importDefault(require("../models/Offer"));
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
const salon_dto_1 = require("../dto/salon.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SalonService {
    constructor(salonRepository, categoryRepository) {
        this._salonRepository = salonRepository;
        this._categoryRepository = categoryRepository;
    }
    createSalon(salonData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(salonData);
            const createSalonDto = (0, class_transformer_1.plainToClass)(salon_dto_1.CreateSalonDto, salonData);
            const errors = yield (0, class_validator_1.validate)(createSalonDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SALON_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const existingSalon = yield this._salonRepository.getSalonByEmail(createSalonDto.email);
            if (existingSalon) {
                throw new cutsomError_1.default("Salon Already Exists", HttpStatus_1.HttpStatus.CONFLICT);
            }
            const categoryData = yield this._categoryRepository.findByName(salonData.category);
            if (!categoryData) {
                throw new cutsomError_1.default("Category not found. Please choose a valid category.", 400);
            }
            salonData.category = categoryData._id;
            const address = `${salonData.address.areaStreet}, ${salonData.address.city}, ${salonData.address.state}, ${salonData.address.pincode}`;
            let location;
            try {
                const response = yield axios_1.default.get(constants_1.GEOLOCATION_API, {
                    params: {
                        address,
                        key: process.env.GOOGLE_MAPS_API_KEY
                    }
                });
                if (response.data.status !== 'OK' || !response.data.results[0]) {
                    throw new cutsomError_1.default("Failed to geocode address. Please provide a valid address", 400);
                }
                const { lng, lat } = response.data.results[0].geometry.location;
                location = {
                    type: 'Point',
                    coordinates: [lng, lat],
                };
            }
            catch (error) {
                console.log(error.message, "error in the geocoding");
            }
            const hashedPassword = yield bcryptjs_1.default.hash(createSalonDto.password, 10);
            let salon = yield this._salonRepository.createSalon({
                salonName: createSalonDto.salonName,
                email: createSalonDto.email,
                phone: Number(createSalonDto.phone),
                password: hashedPassword,
                address: Object.assign(Object.assign({}, createSalonDto.address), { location }),
                category: categoryData._id,
            });
            salon = salon.toObject();
            return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                _id: salon._id.toString(),
                salonName: salon.salonName,
                email: salon.email,
                phone: salon.phone,
                address: salon.address,
                category: salon.category.toString(),
                openingTime: salon.openingTime,
                closingTime: salon.closingTime,
                rating: salon.rating,
                reviewCount: salon.reviewCount,
                images: salon.images,
                services: salon.services,
                verified: salon.verified,
                is_Active: salon.is_Active,
                role: salon.role
            });
        });
    }
    findSalonRaw(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._salonRepository.findSalonRaw(id);
        });
    }
    findSalon(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this._salonRepository.getSalonById(id);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                _id: salon._id.toString(),
                salonName: salon.salonName,
                email: salon.email,
                phone: salon.phone,
                address: salon.address,
                category: salon.category.toString(),
                openingTime: salon.openingTime,
                closingTime: salon.closingTime,
                rating: salon.rating,
                reviewCount: salon.reviewCount,
                images: salon.images,
                services: salon.services,
                verified: salon.verified,
                is_Active: salon.is_Active,
                role: salon.role
            });
        });
    }
    sendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this._salonRepository.getSalonByEmail(email);
            if (!salon) {
                throw new cutsomError_1.default("No account found with this email address. Please check and try again.", 404);
            }
            const otp = (0, otp_1.generateOtp)();
            const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);
            yield this._salonRepository.updateSalonOtp(email, otp, otpExpiry);
            yield (0, otp_1.sendOtpEmail)(email, otp);
            return "OTP has been sent to your email address.";
        });
    }
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this._salonRepository.getSalonByEmail(email);
            if (!salon) {
                throw new cutsomError_1.default("Salon not found with this email. Please ensure your account exists.", 404);
            }
            if (!salon.otp || !salon.otpExpiry || salon.otp !== otp) {
                throw new cutsomError_1.default("Invalid OTP. Please check and try again.", 400);
            }
            if (salon.otpExpiry < new Date()) {
                throw new cutsomError_1.default("OTP has expired. Please request a new one.", 400);
            }
            yield this._salonRepository.verifyOtpAndUpdate(email);
            return "Verification successful. You may now log in.";
        });
    }
    loginSalon(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const loginSalonDto = (0, class_transformer_1.plainToClass)(salon_dto_1.LoginSalonDto, data);
            const errors = yield (0, class_validator_1.validate)(loginSalonDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CREDENTIALS + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._salonRepository.getSalonByEmail(loginSalonDto.email);
            if (!salon) {
                throw new cutsomError_1.default("Salon not found. Please check your email or create an account.", 404);
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(loginSalonDto.password, salon.password);
            if (!isPasswordValid) {
                throw new cutsomError_1.default("Invalid email or password. Please try again.", 400);
            }
            if (!salon.verified) {
                throw new cutsomError_1.default("Please verify your account before logging in.", 400);
            }
            if (!salon.is_Active) {
                throw new cutsomError_1.default("Your account has been deactivated. Please contact customer care.", 403);
            }
            console.log(salon, "salon in login");
            const accessToken = jsonwebtoken_1.default.sign({ id: salon._id, role: salon.role, active: salon.is_Active }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const refreshToken = jsonwebtoken_1.default.sign({ id: salon._id, role: salon.role, active: salon.is_Active }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
            const updateData = {
                refreshToken: refreshToken,
                refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };
            yield this._salonRepository.updateSalon(salon._id.toString(), updateData, { new: true });
            return {
                salon: (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                    _id: salon._id.toString(),
                    salonName: salon.salonName,
                    email: salon.email,
                    phone: salon.phone,
                    address: salon.address,
                    category: salon.category.toString(),
                    openingTime: salon.openingTime,
                    closingTime: salon.closingTime,
                    rating: salon.rating,
                    reviewCount: salon.reviewCount,
                    images: salon.images,
                    services: salon.services,
                    verified: salon.verified,
                    is_Active: salon.is_Active,
                    role: salon.role
                }),
                accessToken,
                refreshToken,
            };
        });
    }
    signOut(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (refreshToken) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                    if (decoded.role == 'Salon') {
                        const salon = yield this._salonRepository.getSalonById(decoded.id);
                        if (salon) {
                            yield this._salonRepository.updateSalon(salon._id.toString(), { refreshToken: null, refreshTokenExpiresAt: null });
                        }
                    }
                }
                catch (error) {
                    console.warn('Invalid refresh token during sign-out:', error);
                }
            }
        });
    }
    getSalonData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                throw new cutsomError_1.default("Salon ID is required to fetch salon data.", 400);
            }
            const salon = yield this._salonRepository.getSalonById(id);
            console.log("salon data in repo", salon);
            return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                _id: salon === null || salon === void 0 ? void 0 : salon._id.toString(),
                salonName: salon === null || salon === void 0 ? void 0 : salon.salonName,
                email: salon === null || salon === void 0 ? void 0 : salon.email,
                phone: salon === null || salon === void 0 ? void 0 : salon.phone,
                address: salon === null || salon === void 0 ? void 0 : salon.address,
                category: salon === null || salon === void 0 ? void 0 : salon.category.toString(),
                openingTime: salon === null || salon === void 0 ? void 0 : salon.openingTime,
                closingTime: salon === null || salon === void 0 ? void 0 : salon.closingTime,
                rating: salon === null || salon === void 0 ? void 0 : salon.rating,
                reviewCount: salon === null || salon === void 0 ? void 0 : salon.reviewCount,
                images: salon === null || salon === void 0 ? void 0 : salon.images,
                services: salon === null || salon === void 0 ? void 0 : salon.services,
                verified: salon === null || salon === void 0 ? void 0 : salon.verified,
                is_Active: salon === null || salon === void 0 ? void 0 : salon.is_Active,
                timeZone: salon === null || salon === void 0 ? void 0 : salon.timeZone,
                role: salon === null || salon === void 0 ? void 0 : salon.role
            });
        });
    }
    getNearbySalons(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { longitude, latitude, radius, search, pincode, maxPrice, ratings, discount, page, limit, sort } = params;
            const skip = (page - 1) * limit;
            if (longitude !== undefined && latitude !== undefined) {
                if (isNaN(longitude) || isNaN(latitude)) {
                    throw new cutsomError_1.default('Invalid longitude or latitude.', 400);
                }
            }
            let query = {};
            if (search) {
                query.$or = [
                    { salonName: { $regex: search, $options: 'i' } },
                    { 'services.name': { $regex: search, $options: 'i' } },
                    { 'address.city': { $regex: search, $options: 'i' } },
                    { 'address.areaStreet': { $regex: search, $options: 'i' } },
                    { 'address.pincode': { $regex: search, $options: 'i' } },
                ];
            }
            if (pincode) {
                query['address.pincode'] = pincode;
            }
            if (maxPrice < 100000) {
                query['services.price'] = { $lte: maxPrice };
            }
            if (ratings.length > 0) {
                query.rating = { $in: ratings };
            }
            if (discount > 0) {
                const offerSalonIds = yield Offer_1.default.find({
                    discount: { $gte: discount },
                    isActive: true,
                    expiryDate: { $gte: new Date() },
                }).distinct('salonId');
                query._id = { $in: offerSalonIds };
            }
            let sortOption = {};
            switch (sort) {
                // case "price_asc":
                //   sortOption = { "services.price": 1 };
                //   break;
                // case "price_desc":
                //   sortOption = { "services.price": -1 };
                //   break;
                case "name_asc":
                    sortOption = { salonName: 1 };
                    break;
                case "name_desc":
                    sortOption = { salonName: -1 };
                    break;
                case "rating_asc":
                    sortOption = { rating: 1 };
                    break;
                case "rating_desc":
                default:
                    sortOption = { rating: -1 };
            }
            let salons = [];
            let totalSalons = 0;
            if (longitude !== undefined && latitude !== undefined) {
                salons = yield this._salonRepository.getNearbySalons(longitude, latitude, radius, query, skip, limit, sortOption);
                totalSalons = yield this._salonRepository.countNearbySalons(longitude, latitude, radius, query);
            }
            else {
                salons = yield this._salonRepository.getAllSalons(query, skip, limit, sortOption);
                totalSalons = yield this._salonRepository.countAllSalons(query);
            }
            return {
                salons: salons.map((salon) => {
                    var _a, _b;
                    return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                        _id: salon._id.toString(),
                        salonName: salon.salonName,
                        email: salon.email,
                        phone: salon.phone,
                        address: salon.address,
                        category: ((_b = (_a = salon.category) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || null,
                        openingTime: salon.openingTime,
                        closingTime: salon.closingTime,
                        rating: salon.rating,
                        reviewCount: salon.reviewCount,
                        images: salon.images,
                        services: salon.services,
                        verified: salon.verified,
                        is_Active: salon.is_Active,
                        timeZone: salon.timeZone,
                        role: salon.role
                    });
                }),
                totalSalons,
                totalPages: Math.ceil(totalSalons / limit),
            };
        });
    }
    getFilteredSalons(filters, page, itemsPerPage) {
        return __awaiter(this, void 0, void 0, function* () {
            const { salons, total } = yield this._salonRepository.findAllSalons(filters, page, itemsPerPage);
            const totalPages = Math.ceil(total / itemsPerPage);
            return {
                salons: salons.map((salon) => (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                    _id: salon._id.toString(),
                    salonName: salon.salonName,
                    email: salon.email,
                    phone: salon.phone,
                    address: salon.address,
                    category: salon.category.toString(),
                    openingTime: salon.openingTime,
                    closingTime: salon.closingTime,
                    rating: salon.rating,
                    reviewCount: salon.reviewCount,
                    images: salon.images,
                    services: salon.services,
                    verified: salon.verified,
                    is_Active: salon.is_Active,
                    timeZone: salon === null || salon === void 0 ? void 0 : salon.timeZone,
                    role: salon.role
                })),
                total,
                totalPages
            };
        });
    }
    salonProfileUpdate(updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateSalonDto = (0, class_transformer_1.plainToClass)(salon_dto_1.UpdateSalonDto, updatedData);
            const errors = yield (0, class_validator_1.validate)(updateSalonDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SALON_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._salonRepository.getSalonById(updateSalonDto.id);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const address = `${updateSalonDto.address.areaStreet}, ${updateSalonDto.address.city}, ${updateSalonDto.address.state}, ${updateSalonDto.address.pincode}`;
            let location;
            try {
                const response = yield axios_1.default.get(constants_1.GEOLOCATION_API, {
                    params: {
                        address,
                        key: process.env.GOOGLE_MAPS_API_KEY,
                    },
                });
                if (response.data.status !== 'OK' || !response.data.results[0]) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_ADDRESS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const { lng, lat } = response.data.results[0].geometry.location;
                location = {
                    type: 'Point',
                    coordinates: [lng, lat],
                };
            }
            catch (error) {
                throw new cutsomError_1.default(Messages_1.Messages.GEOCODING_NOT_FOUND, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const updatedSalon = yield this._salonRepository.updateSalonProfile({
                salonName: updateSalonDto.salonName,
                email: updateSalonDto.email,
                phone: updateSalonDto.phone,
                address: Object.assign(Object.assign({}, updateSalonDto.address), { location }),
                openingTime: updateSalonDto.openingTime,
                closingTime: updateSalonDto.closingTime,
                timeZone: updateSalonDto.timeZone,
            });
            if (!updatedSalon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                _id: updatedSalon._id.toString(),
                salonName: updatedSalon.salonName,
                email: updatedSalon.email,
                phone: updatedSalon.phone,
                address: updatedSalon.address,
                category: updatedSalon.category.toString(),
                openingTime: updatedSalon.openingTime,
                closingTime: updatedSalon.closingTime,
                rating: updatedSalon.rating,
                reviewCount: updatedSalon.reviewCount,
                images: updatedSalon.images,
                services: updatedSalon.services,
                verified: updatedSalon.verified,
                is_Active: updatedSalon.is_Active,
                timeZone: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.timeZone,
                role: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.role
            });
        });
    }
    updateSalonStatus(id, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedSalon = yield this._salonRepository.updateSalonStatus(id, isActive);
            if (!updatedSalon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                _id: updatedSalon._id.toString(),
                salonName: updatedSalon.salonName,
                email: updatedSalon.email,
                phone: updatedSalon.phone,
                address: updatedSalon.address,
                category: updatedSalon.category.toString(),
                openingTime: updatedSalon.openingTime,
                closingTime: updatedSalon.closingTime,
                rating: updatedSalon.rating,
                reviewCount: updatedSalon.reviewCount,
                images: updatedSalon.images,
                services: updatedSalon.services,
                verified: updatedSalon.verified,
                is_Active: updatedSalon.is_Active,
                timeZone: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.timeZone,
                role: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.role
            });
        });
    }
    getAllSalons(page, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(page) || page < 1) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const query = {};
            if (search) {
                query.$or = [
                    { salonName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            let { data: salons, totalCount } = yield this._salonRepository.getAllSalon(page, query);
            const totalPages = Math.ceil(totalCount / 10);
            salons = salons.map((salon) => salon.toObject());
            return { salonData: salons.map((salon) => {
                    var _a, _b;
                    return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                        _id: salon._id.toString(),
                        salonName: salon.salonName,
                        email: salon.email,
                        phone: salon.phone,
                        address: salon.address,
                        category: (_b = (_a = salon.category) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
                        openingTime: salon.openingTime,
                        closingTime: salon.closingTime,
                        rating: salon.rating,
                        reviewCount: salon.reviewCount,
                        images: salon.images,
                        services: salon.services,
                        verified: salon.verified,
                        is_Active: salon.is_Active,
                        timeZone: salon === null || salon === void 0 ? void 0 : salon.timeZone,
                        role: salon.role
                    });
                }), totalPages };
        });
    }
    allSalonListForChat() {
        return __awaiter(this, void 0, void 0, function* () {
            const salons = yield this._salonRepository.allSalonListForChat();
            return salons.map((salon) => {
                var _a;
                return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                    _id: (_a = salon._id) === null || _a === void 0 ? void 0 : _a.toString(),
                    salonName: salon.salonName,
                    email: salon.email,
                    images: salon.images,
                });
            });
        });
    }
    uploadSalonImage(salonId, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this._salonRepository.getSalonById(salonId);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            try {
                const { public_id, secure_url } = yield cloudinary_1.default.uploader.upload(filePath, {
                    folder: "salon_gallery"
                });
                const imageData = { id: public_id, url: secure_url };
                const updatedSalon = yield this._salonRepository.addImagesToSalon(salonId, imageData);
                if (!updatedSalon) {
                    throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
                }
                return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                    _id: updatedSalon._id.toString(),
                    salonName: updatedSalon.salonName,
                    email: updatedSalon.email,
                    phone: updatedSalon.phone,
                    address: updatedSalon.address,
                    category: updatedSalon.category.toString(),
                    openingTime: updatedSalon.openingTime,
                    closingTime: updatedSalon.closingTime,
                    rating: updatedSalon.rating,
                    reviewCount: updatedSalon.reviewCount,
                    images: updatedSalon.images,
                    services: updatedSalon.services,
                    verified: updatedSalon.verified,
                    is_Active: updatedSalon.is_Active,
                    timeZone: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.timeZone,
                    role: updatedSalon.role
                });
                ;
            }
            catch (error) {
                console.log(error);
                return null;
            }
        });
    }
    deleteSalonImage(salonId, imageId, cloudinaryImageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this._salonRepository.getSalonById(salonId);
            if (!salon) {
                throw new cutsomError_1.default("Salon not found. Please verify the salon ID.", 404);
            }
            const imageExists = salon.images.some((image) => image._id.toString() === imageId);
            if (!imageExists) {
                throw new cutsomError_1.default(Messages_1.Messages.IMAGE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            try {
                yield cloudinary_1.default.uploader.destroy(cloudinaryImageId);
                const updatedSalon = yield this._salonRepository.deleteSalonImage(salonId, imageId);
                if (!updatedSalon) {
                    throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
                }
                return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                    _id: updatedSalon._id.toString(),
                    salonName: updatedSalon.salonName,
                    email: updatedSalon.email,
                    phone: updatedSalon.phone,
                    address: updatedSalon.address,
                    category: updatedSalon.category.toString(),
                    openingTime: updatedSalon.openingTime,
                    closingTime: updatedSalon.closingTime,
                    rating: updatedSalon.rating,
                    reviewCount: updatedSalon.reviewCount,
                    images: updatedSalon.images,
                    services: updatedSalon.services,
                    verified: updatedSalon.verified,
                    is_Active: updatedSalon.is_Active,
                    timeZone: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.timeZone,
                    role: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.role
                });
            }
            catch (error) {
                throw new cutsomError_1.default(Messages_1.Messages.IMAGE_DELETION_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    addService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const addServiceDto = (0, class_transformer_1.plainToClass)(salon_dto_1.AddServiceDto, data);
            const errors = yield (0, class_validator_1.validate)(addServiceDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            console.log("we entered here");
            const salon = yield this._salonRepository.getSalonById(addServiceDto.salonId);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const updatedSalon = yield this._salonRepository.addService(addServiceDto.salonId, {
                name: addServiceDto.name,
                description: addServiceDto.description,
                service: addServiceDto.service,
                price: addServiceDto.price,
                duration: addServiceDto.duration,
                stylists: addServiceDto.stylists,
            });
            if (!updatedSalon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                _id: updatedSalon._id.toString(),
                salonName: updatedSalon.salonName,
                email: updatedSalon.email,
                phone: updatedSalon.phone,
                address: updatedSalon.address,
                category: updatedSalon.category.toString(),
                openingTime: updatedSalon.openingTime,
                closingTime: updatedSalon.closingTime,
                rating: updatedSalon.rating,
                reviewCount: updatedSalon.reviewCount,
                images: updatedSalon.images,
                services: updatedSalon.services,
                verified: updatedSalon.verified,
                is_Active: updatedSalon.is_Active,
                timeZone: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.timeZone,
                role: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.role
            });
        });
    }
    updateService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateServiceDto = (0, class_transformer_1.plainToClass)(salon_dto_1.UpdateServiceDto, data);
            const errors = yield (0, class_validator_1.validate)(updateServiceDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._salonRepository.getSalonById(updateServiceDto.salonId);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const serviceExists = salon.services.some((s) => s._id.toString() === updateServiceDto.serviceId);
            if (!serviceExists) {
                throw new cutsomError_1.default(Messages_1.Messages.SERVICE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const updatedSalon = yield this._salonRepository.updateService(updateServiceDto.salonId, updateServiceDto.serviceId, {
                name: updateServiceDto.name,
                description: updateServiceDto.description,
                service: new mongoose_1.default.Types.ObjectId(updateServiceDto.service),
                price: updateServiceDto.price,
                duration: updateServiceDto.duration,
                stylists: updateServiceDto.stylists.map((id) => new mongoose_1.default.Types.ObjectId(id)),
            });
            if (!updatedSalon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                _id: updatedSalon._id.toString(),
                salonName: updatedSalon.salonName,
                email: updatedSalon.email,
                phone: updatedSalon.phone,
                address: updatedSalon.address,
                category: updatedSalon.category.toString(),
                openingTime: updatedSalon.openingTime,
                closingTime: updatedSalon.closingTime,
                rating: updatedSalon.rating,
                reviewCount: updatedSalon.reviewCount,
                images: updatedSalon.images,
                services: updatedSalon.services,
                verified: updatedSalon.verified,
                is_Active: updatedSalon.is_Active,
                timeZone: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.timeZone,
                role: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.role
            });
        });
    }
    removeService(salonId, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!salonId || !serviceId) {
                throw new cutsomError_1.default("Both Salon ID and Service ID are required to remove a service.", 400);
            }
            const salon = yield this._salonRepository.getSalonById(salonId);
            if (!salon) {
                throw new cutsomError_1.default("Salon not found. Please verify the salon ID.", 404);
            }
            const serviceExists = salon.services.some((s) => s._id.toString());
            if (!serviceExists) {
                throw new cutsomError_1.default(Messages_1.Messages.SERVICE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const updatedSalon = yield this._salonRepository.removeService(salonId, serviceId);
            if (!updatedSalon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(salon_dto_1.SalonDto, {
                _id: updatedSalon._id.toString(),
                salonName: updatedSalon.salonName,
                email: updatedSalon.email,
                phone: updatedSalon.phone,
                address: updatedSalon.address,
                category: updatedSalon.category.toString(),
                openingTime: updatedSalon.openingTime,
                closingTime: updatedSalon.closingTime,
                rating: updatedSalon.rating,
                reviewCount: updatedSalon.reviewCount,
                images: updatedSalon.images,
                services: updatedSalon.services,
                verified: updatedSalon.verified,
                is_Active: updatedSalon.is_Active,
                timeZone: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.timeZone,
                role: updatedSalon === null || updatedSalon === void 0 ? void 0 : updatedSalon.role
            });
        });
    }
}
exports.default = SalonService;
