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
const HttpStatus_1 = require("../constants/HttpStatus");
const Messages_1 = require("../constants/Messages");
const mongoose_1 = __importDefault(require("mongoose"));
class ReviewService {
    constructor(repository, appointmentService) {
        this._reviewRepository = repository;
        this._appointmentService = appointmentService;
    }
    createReview(userId, reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const { salonId, stylistId, appointmentId, salonRating, salonComment, stylistRating, stylistComment } = reviewData;
            if (!salonId || !appointmentId || salonRating == null) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_REVIEW_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(salonId) ||
                !mongoose_1.default.Types.ObjectId.isValid(appointmentId) ||
                (stylistId && !mongoose_1.default.Types.ObjectId.isValid(stylistId))) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_REVIEW_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (salonRating < 1 || salonRating > 5 || (stylistRating && (stylistRating < 1 || stylistRating > 5))) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_RATING_RANGE, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const appointment = yield this._reviewRepository.findAppointmentById(appointmentId.toString());
            if (!appointment) {
                throw new cutsomError_1.default(Messages_1.Messages.APPOINTMENT_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            if (appointment.status !== "completed") {
                throw new cutsomError_1.default(Messages_1.Messages.REVIEW_NOT_ALLOWED, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (appointment.user.toString() !== userId) {
                throw new cutsomError_1.default(Messages_1.Messages.UNAUTHORIZED_REVIEW, HttpStatus_1.HttpStatus.FORBIDDEN);
            }
            const existingReview = yield this._reviewRepository.findReviewByAppointmentId(appointmentId.toString());
            if (existingReview) {
                throw new cutsomError_1.default(Messages_1.Messages.REVIEW_ALREADY_SUBMITTED, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._reviewRepository.findSalonById(salonId.toString());
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const review = yield this._reviewRepository.createReview({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                salonId,
                stylistId,
                appointmentId,
                salonRating,
                salonComment,
                stylistRating,
                stylistComment,
            });
            yield this._appointmentService.updatedAppointmentReview(appointmentId.toString());
            const salonReviews = yield this._reviewRepository.findSalonReviews(salonId.toString());
            const salonAvgRating = salonReviews.length
                ? salonReviews.reduce((sum, r) => sum + r.salonRating, 0) / salonReviews.length
                : 0;
            yield this._reviewRepository.updateSalonRating(salonId.toString(), salonAvgRating, salonReviews.length);
            if (stylistId) {
                const stylistReviews = yield this._reviewRepository.findStylistReviews(stylistId.toString());
                const stylistAvgRating = stylistReviews.length
                    ? stylistReviews.reduce((sum, r) => sum + (r.stylistRating || 0), 0) / stylistReviews.length
                    : 0;
                yield this._reviewRepository.updateStylistRating(stylistId.toString(), stylistAvgRating, stylistReviews.length);
            }
            return review;
        });
    }
    getSalonReviews(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!salonId || !mongoose_1.default.Types.ObjectId.isValid(salonId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            return yield this._reviewRepository.findSalonReviews(salonId);
        });
    }
    getStylistReviews(stylistId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!stylistId || !mongoose_1.default.Types.ObjectId.isValid(stylistId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            return yield this._reviewRepository.findStylistReviews(stylistId);
        });
    }
}
exports.default = ReviewService;
