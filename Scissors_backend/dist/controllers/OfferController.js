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
class OfferController {
    constructor(offerService) {
        this._offerService = offerService;
    }
    createOffer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const offerData = req.body;
                const offer = yield this._offerService.createOffer(userId, offerData);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.OFFER_CREATED,
                    offer,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSalonOffers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salonId = req.query.id;
                const offers = yield this._offerService.getSalonOffer(salonId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.OFFERS_RETRIEVED,
                    offers,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateOfferStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const offerId = req.params.id;
                const result = yield this._offerService.updateOfferStatus(offerId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.OFFER_UPDATED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteOffer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const offerId = req.params.id;
                const result = yield this._offerService.deleteOffer(offerId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.OFFER_DELETED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = OfferController;
