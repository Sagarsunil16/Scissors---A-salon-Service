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
class StylistController {
    constructor(stylistService) {
        this._stylistService = stylistService;
    }
    createStylist(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const result = yield this._stylistService.createStylist(req.body);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.STYLIST_CREATED,
                    result,
                });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.CREATE_STYLIST_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
    getStylistbySalonId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.query);
                const { id, page = "1", limit = "10", search = "" } = req.query;
                const pageNumber = parseInt(page, 10) || 1;
                const limitNumber = parseInt(limit, 10) || 10;
                const options = {
                    page: pageNumber,
                    limit: limitNumber,
                };
                const result = yield this._stylistService.findStylist(id, options, search);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.STYLISTS_FETCHED_BY_SALON,
                    result,
                });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.FETCH_STYLISTS_BY_SALON_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
    updateStylist(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const updatedStylist = yield this._stylistService.updateStylist(id, req.body);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.STYLIST_UPDATED,
                    success: true,
                    data: updatedStylist,
                });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.UPDATE_STYLIST_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
    getStylistById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this._stylistService.findStylistById(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.STYLIST_FETCHED,
                    result,
                });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.FETCH_STYLIST_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
    deleteStylist(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this._stylistService.deleteStylist(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.STYLIST_DELETED,
                    result,
                });
            }
            catch (error) {
                next(new cutsomError_1.default(error.message || Messages_1.Messages.DELETE_STYLIST_FAILED, HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR));
            }
        });
    }
}
exports.default = StylistController;
