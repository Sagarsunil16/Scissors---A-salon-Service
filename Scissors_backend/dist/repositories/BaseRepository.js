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
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.create(data);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id);
        });
    }
    findOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(filter);
        });
    }
    findOneAndUpdate(filter_1, update_1) {
        return __awaiter(this, arguments, void 0, function* (filter, update, options = { new: true }) {
            return yield this.model.findOneAndUpdate(filter, update, options);
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndDelete(id);
        });
    }
    updateById(id_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (id, data, options = { new: true }) {
            return yield this.model.findByIdAndUpdate(id, data, options);
        });
    }
    findAll() {
        return __awaiter(this, arguments, void 0, function* (filter = {}, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const data = yield this.model.find(filter).skip(skip).limit(limit);
            const totalCount = yield this.model.countDocuments(filter);
            return { data, totalCount };
        });
    }
    countDocuments() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            return yield this.model.countDocuments(filter);
        });
    }
}
exports.BaseRepository = BaseRepository;
