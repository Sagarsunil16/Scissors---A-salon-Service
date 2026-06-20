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
class ServiceController {
    constructor(serService) {
        this._salonMenuService = serService;
    }
    createService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this._salonMenuService.createService(req.body);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SERVICE_CREATED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllServices(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", search = "" } = req.query;
                const pageNumber = parseInt(page, 10) || 1;
                const result = yield this._salonMenuService.getAllServices(pageNumber, search);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SERVICES_FETCHED,
                    services: result.services,
                    totalPages: Math.ceil(result.totalCount / 10),
                    pagination: {
                        totalItems: result.totalCount,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage,
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this._salonMenuService.updateService(req.body);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SERVICE_UPDATED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.query.id;
                const result = yield this._salonMenuService.deleteService(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.SERVICE_DELETED,
                    result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ServiceController;
