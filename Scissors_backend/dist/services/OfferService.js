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
const HttpStatus_1 = require("../constants/HttpStatus");
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const Messages_1 = require("../constants/Messages");
class OfferService {
    constructor(repository) {
        this._repository = repository;
    }
    createOffer(userId, offerData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            const { salonId, title, description, discount, serviceIds, expiryDate } = offerData;
            if (!salonId || !title || discount == null || !serviceIds || !expiryDate) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_OFFER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._repository.findBySalonId(salonId.toString());
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            if (new Date(expiryDate) <= new Date()) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_EXPIRY_DATE, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (serviceIds && serviceIds.length > 0) {
                const validServiceIds = salon.services.map((s) => s.service.toString());
                const invalidServices = serviceIds.filter((id) => !validServiceIds.includes(id.toString()));
                if (invalidServices.length > 0) {
                    throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_IDS, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
            }
            return yield this._repository.create(offerData);
        });
    }
    getSalonOffer(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!salonId) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_ID_REQUIRED, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._repository.findBySalonId(salonId);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return yield this._repository.findOffersBySalonId(salonId);
        });
    }
    updateOfferStatus(offerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!offerId) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_OFFER_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const offer = yield this._repository.findById(offerId);
            if (!offer) {
                throw new cutsomError_1.default(Messages_1.Messages.OFFER_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const updateData = { isActive: !offer.isActive };
            const result = yield this._repository.updateOffer(offerId, updateData);
            if (!result) {
                throw new cutsomError_1.default(Messages_1.Messages.OFFER_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return result;
        });
    }
    deleteOffer(offerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!offerId) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_OFFER_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const offer = yield this._repository.findById(offerId);
            if (!offer) {
                throw new cutsomError_1.default(Messages_1.Messages.OFFER_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return yield this._repository.deleteOffer(offerId);
        });
    }
}
exports.default = OfferService;
