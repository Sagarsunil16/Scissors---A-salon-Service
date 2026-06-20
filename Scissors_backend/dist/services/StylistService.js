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
const mongoose_1 = __importDefault(require("mongoose"));
class StylistService {
    constructor(stylistRepository, serviceRepository, salonRepository) {
        this._stylistRepository = stylistRepository;
        this._serviceRepository = serviceRepository;
        this._salonRepository = salonRepository;
    }
    createStylist(stylistData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(stylistData, "stylistData");
            const { name, salon, services } = stylistData;
            if (!name || !salon || !services || !mongoose_1.default.Types.ObjectId.isValid(salon.toString())) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_STYLIST_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salonExists = yield this._salonRepository.getSalonById(salon.toString());
            if (!salonExists) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const serviceChecks = yield Promise.all(services.map((serviceId) => this._serviceRepository.findServiceById(serviceId.toString())));
            if (serviceChecks.some((service) => !service)) {
                throw new cutsomError_1.default(Messages_1.Messages.SERVICE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return yield this._stylistRepository.createStylist(stylistData);
        });
    }
    findStylist(salonId, options, searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!salonId || !mongoose_1.default.Types.ObjectId.isValid(salonId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SALON_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            if (options.page < 1 || options.limit < 1) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const salon = yield this._salonRepository.getSalonById(salonId);
            if (!salon) {
                throw new cutsomError_1.default(Messages_1.Messages.SALON_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return yield this._stylistRepository.findStylists(salonId, options, searchTerm);
        });
    }
    updateStylist(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_STYLIST_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const existingStylist = yield this._stylistRepository.findStylistById(id);
            if (!existingStylist) {
                throw new cutsomError_1.default(Messages_1.Messages.STYLIST_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            if (updateData.services) {
                const services = yield Promise.all(updateData.services.map((serviceId) => this._serviceRepository.findServiceById(serviceId.toString())));
                if (services.some((service) => !service)) {
                    throw new cutsomError_1.default(Messages_1.Messages.SERVICE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
                }
            }
            const updatedStylist = yield this._stylistRepository.updateStylist(id, updateData);
            if (!updatedStylist) {
                throw new cutsomError_1.default(Messages_1.Messages.STYLIST_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return updatedStylist;
        });
    }
    findStylistById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_STYLIST_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const stylist = yield this._stylistRepository.findStylistById(id);
            if (!stylist) {
                throw new cutsomError_1.default(Messages_1.Messages.STYLIST_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return stylist;
        });
    }
    deleteStylist(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_STYLIST_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const existingStylist = yield this._stylistRepository.findStylistById(id);
            if (!existingStylist) {
                throw new cutsomError_1.default(Messages_1.Messages.STYLIST_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const result = yield this._stylistRepository.deleteStylist(id);
            if (!result) {
                throw new cutsomError_1.default(Messages_1.Messages.STYLIST_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return result;
        });
    }
}
exports.default = StylistService;
