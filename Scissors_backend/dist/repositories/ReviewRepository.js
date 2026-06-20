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
const BaseRepository_1 = require("./BaseRepository");
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Review_1 = __importDefault(require("../models/Review"));
const SalonRepository_1 = __importDefault(require("./SalonRepository"));
const StylistRepository_1 = __importDefault(require("./StylistRepository"));
// Minimal AppointmentRepository until a proper one is provided
class AppointmentRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Appointment_1.default);
    }
}
const appointmentRepo = new AppointmentRepository();
const salonRepo = new SalonRepository_1.default();
const stylistRepo = new StylistRepository_1.default();
class ReviewRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Review_1.default);
    }
    createReview(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(data);
        });
    }
    findReviewByAppointmentId(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOne({ appointmentId });
        });
    }
    findAppointmentById(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield appointmentRepo.findById(appointmentId);
        });
    }
    findSalonById(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield salonRepo.findById(salonId);
        });
    }
    findSalonReviews(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .find({ salonId })
                .populate([
                { path: "userId", select: "firstname lastname" },
                { path: "stylistId", select: "name" },
            ])
                .lean()
                .exec();
        });
    }
    findStylistReviews(stylistId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .find({ stylistId })
                .populate([
                { path: "userId", select: "firstname lastname" },
                { path: "salonId", select: "salonName" },
            ])
                .lean()
                .exec();
        });
    }
    updateSalonRating(salonId, rating, reviewCount) {
        return __awaiter(this, void 0, void 0, function* () {
            yield salonRepo.updateById(salonId, { rating, reviewCount }, { new: true });
        });
    }
    updateStylistRating(stylistId, rating, reviewCount) {
        return __awaiter(this, void 0, void 0, function* () {
            yield stylistRepo.updateById(stylistId, { rating, reviewCount }, { new: true });
        });
    }
}
exports.default = ReviewRepository;
