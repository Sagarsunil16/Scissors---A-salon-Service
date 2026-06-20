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
const Service_1 = __importDefault(require("../models/Service"));
class ServiceRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Service_1.default);
    }
    createService(serviceData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(serviceData);
        });
    }
    findServiceById(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(serviceId).lean().exec();
        });
    }
    getAllServices(page_1) {
        return __awaiter(this, arguments, void 0, function* (page, query = {}, limit = 6) {
            const skip = (page - 1) * limit;
            const [services, totalCount] = yield Promise.all([
                this.model.find(query).skip(skip).limit(limit).lean().exec(),
                this.model.countDocuments(query).exec(),
            ]);
            return { services, totalCount };
        });
    }
    deleteService(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndDelete(id).lean().exec();
        });
    }
    updateService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = { name: data.name, description: data.description };
            return yield this.model.findByIdAndUpdate(data.id, updateData, { new: true }).lean().exec();
        });
    }
}
exports.default = ServiceRepository;
