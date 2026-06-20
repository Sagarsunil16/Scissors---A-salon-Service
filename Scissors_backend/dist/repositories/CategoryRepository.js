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
const Category_1 = __importDefault(require("../models/Category"));
class CategoryRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Category_1.default);
    }
    findByIdCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id).lean().exec();
        });
    }
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ name }).lean().exec();
        });
    }
    getAllCategory() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find({}).lean().exec();
        });
    }
    createCategory(categoryData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(categoryData);
        });
    }
    updateCategory(id, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, Object.assign({}, updatedData), { new: true }).lean().exec();
        });
    }
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndDelete(id).lean().exec();
        });
    }
    getCategoriesPaginated(query, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find(query).skip(skip).limit(limit).lean().exec();
        });
    }
    countCategories(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments(query).exec();
        });
    }
}
exports.default = CategoryRepository;
