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
const class_transformer_1 = require("class-transformer");
const HttpStatus_1 = require("../constants/HttpStatus");
const Messages_1 = require("../constants/Messages");
const category_dto_1 = require("../dto/category.dto");
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const class_validator_1 = require("class-validator");
class CategoryService {
    constructor(repository) {
        this._repository = repository;
    }
    getAllCategory() {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield this._repository.getAllCategory();
            if (!categories || categories.length === 0) {
                throw new cutsomError_1.default(Messages_1.Messages.NO_CATEGORIES_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return categories.map((category) => (0, class_transformer_1.plainToClass)(category_dto_1.CategoryDto, {
                _id: category._id.toString(),
                name: category.name,
                description: category.description,
            }));
        });
    }
    getFilteredCategory(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageNumber = parseInt(page.toString(), 10);
            const limitNumber = parseInt(limit.toString(), 10);
            if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const skip = (pageNumber - 1) * limitNumber;
            const query = {};
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }
            const [categories, totalItems] = yield Promise.all([
                this._repository.getCategoriesPaginated(query, skip, limitNumber),
                this._repository.countCategories(query),
            ]);
            const totalPages = Math.ceil(totalItems / limitNumber);
            return {
                categories: categories.map((category) => (0, class_transformer_1.plainToClass)(category_dto_1.CategoryDto, {
                    _id: category._id.toString(),
                    name: category.name,
                    description: category.description,
                })),
                totalItems,
                totalPages,
                currentPage: pageNumber,
            };
        });
    }
    createCategory(categoryData) {
        return __awaiter(this, void 0, void 0, function* () {
            const createCategoryDto = (0, class_transformer_1.plainToClass)(category_dto_1.CreateCategoryDto, categoryData);
            const errors = yield (0, class_validator_1.validate)(createCategoryDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CATEGORY_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const existingCategory = yield this._repository.findByName(createCategoryDto.name);
            if (existingCategory) {
                throw new cutsomError_1.default("Category already exists", HttpStatus_1.HttpStatus.CONFLICT);
            }
            const result = yield this._repository.createCategory({
                name: createCategoryDto.name,
                description: createCategoryDto.description,
            });
            return (0, class_transformer_1.plainToClass)(category_dto_1.CategoryDto, {
                _id: result._id.toString(),
                name: result.name,
                description: result.description,
            });
        });
    }
    updateCategory(updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateCategoryDto = (0, class_transformer_1.plainToClass)(category_dto_1.UpdateCategoryDto, updatedData);
            const errors = yield (0, class_validator_1.validate)(updateCategoryDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CATEGORY_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const category = yield this._repository.findByIdCategory(updateCategoryDto.id);
            if (!category) {
                throw new cutsomError_1.default(Messages_1.Messages.CATEGORY_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const result = yield this._repository.updateCategory(updateCategoryDto.id, {
                name: updateCategoryDto.name,
                description: updateCategoryDto.description,
            });
            if (!result) {
                throw new cutsomError_1.default(Messages_1.Messages.CATEGORY_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(category_dto_1.CategoryDto, {
                _id: result._id.toString(),
                name: result.name,
                description: result.description,
            });
        });
    }
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_CATEGORY_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const category = yield this._repository.findByIdCategory(id);
            if (!category) {
                throw new cutsomError_1.default(Messages_1.Messages.CATEGORY_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            yield this._repository.deleteCategory(id);
            return Messages_1.Messages.CATEGORY_DELETED;
        });
    }
}
exports.default = CategoryService;
