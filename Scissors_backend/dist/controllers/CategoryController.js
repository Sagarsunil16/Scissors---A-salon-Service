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
class CategoryController {
    constructor(categoryService) {
        this._categoryService = categoryService;
    }
    getAllCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield this._categoryService.getAllCategory();
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.CATEGORIES_FETCHED,
                    categories,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getFilteredCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, search = "" } = req.query;
                const result = yield this._categoryService.getFilteredCategory(Number(page), Number(limit), search);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.CATEGORIES_FETCHED,
                    categories: result.categories,
                    Pagination: {
                        totalItems: result.totalItems,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    addNewCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoryData = req.body;
                const result = yield this._categoryService.createCategory(categoryData);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.CATEGORY_CREATED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    editCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoryData = req.body;
                const result = yield this._categoryService.updateCategory(categoryData);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.CATEGORY_UPDATED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                console.log(req.body);
                const result = yield this._categoryService.deleteCategory(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.CATEGORY_DELETED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = CategoryController;
