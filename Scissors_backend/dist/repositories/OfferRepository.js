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
const Offer_1 = __importDefault(require("../models/Offer"));
const SalonRepository_1 = __importDefault(require("./SalonRepository"));
const salonRepo = new SalonRepository_1.default();
class OfferRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Offer_1.default);
    }
    findOffersBySalonId(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .find({ salonId, expiryDate: { $gte: new Date() } })
                .populate("serviceIds", "name")
                .exec();
        });
    }
    findBySalonId(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield salonRepo.findById(salonId);
        });
    }
    countOffersBySalonId(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.countDocuments({
                salonId,
                isActive: true,
                expiryDate: { $gte: new Date() },
            });
        });
    }
    updateOffer(offerId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.updateById(offerId, updateData);
        });
    }
    deleteOffer(offerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.deleteById(offerId);
        });
    }
}
exports.default = OfferRepository;
