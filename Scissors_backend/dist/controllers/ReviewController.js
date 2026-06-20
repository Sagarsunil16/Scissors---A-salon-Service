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
Object.defineProperty(exports, "__esModule", { value: true });
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
class ReviewController {
    constructor(reviewService) {
        this._reviewService = reviewService;
    }
    createReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const reviewData = req.body;
                const review = yield this._reviewService.createReview(userId, reviewData);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.REVIEW_CREATED,
                    review,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSalonReviews(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const reviews = yield this._reviewService.getSalonReviews(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SALON_REVIEWS_RETRIEVED,
                    reviews,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStylistReviews(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const reviews = yield this._reviewService.getStylistReviews(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.STYLIST_REVIEWS_RETRIEVED,
                    reviews,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ReviewController;
