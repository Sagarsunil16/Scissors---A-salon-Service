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
const Stylist_1 = __importDefault(require("../models/Stylist"));
class StylistRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Stylist_1.default);
    }
    createStylist(stylistData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(stylistData);
        });
    }
    findStylistById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id).exec();
        });
    }
    findStylists(salonId_1, _a, searchTerm_1) {
        return __awaiter(this, arguments, void 0, function* (salonId, { page, limit }, searchTerm) {
            const query = { salon: salonId };
            if (searchTerm) {
                query.$or = [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { email: { $regex: searchTerm, $options: "i" } },
                    { phone: { $regex: searchTerm, $options: "i" } },
                ];
            }
            const result = yield this.findAll(query, page, limit);
            yield this.model.populate(result.data, { path: "services" });
            return { stylists: result.data, totalCount: result.totalCount };
        });
    }
    updateStylist(id, stylistData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateOptions = { new: true, runValidators: true };
            let stylist = yield this.updateById(id, stylistData, updateOptions);
            if (stylist && (options === null || options === void 0 ? void 0 : options.populateServices)) {
                stylist = yield this.model.populate(stylist, { path: "services" });
            }
            return stylist;
        });
    }
    deleteStylist(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteById(id);
            return true;
        });
    }
}
exports.default = StylistRepository;
