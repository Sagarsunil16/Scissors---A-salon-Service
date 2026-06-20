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
const service_dto_1 = require("../dto/service.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SalonMenuService {
    constructor(repository) {
        this._repository = repository;
    }
    findServiceById(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!serviceId || !mongoose_1.default.Types.ObjectId.isValid(serviceId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const service = yield this._repository.findServiceById(serviceId);
            if (!service) {
                throw new cutsomError_1.default(Messages_1.Messages.SERVICE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(service_dto_1.ServiceDto, {
                _id: service._id.toString(),
                name: service.name,
                description: service.description,
            });
        });
    }
    createService(serviceData) {
        return __awaiter(this, void 0, void 0, function* () {
            const createServiceDto = (0, class_transformer_1.plainToClass)(service_dto_1.CreateServiceDto, serviceData);
            const errors = yield (0, class_validator_1.validate)(createServiceDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            let result = yield this._repository.createService({
                name: createServiceDto.name,
                description: createServiceDto.description,
            });
            result.toObject();
            return (0, class_transformer_1.plainToClass)(service_dto_1.ServiceDto, {
                _id: result._id.toString(),
                name: result.name,
                description: result.description,
            });
        });
    }
    getAllServices(page, search) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(page) || page < 1) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const limit = 6;
            const query = {};
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }
            const result = yield this._repository.getAllServices(page, query, limit);
            if (!result || result.services.length === 0) {
                throw new cutsomError_1.default(Messages_1.Messages.NO_SERVICES_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return {
                services: result.services.map((service) => (0, class_transformer_1.plainToClass)(service_dto_1.ServiceDto, {
                    _id: service._id.toString(),
                    name: service.name,
                    description: service.description,
                })),
                totalCount: result.totalCount,
                totalPages: Math.ceil(result.totalCount / limit),
                currentPage: page,
            };
        });
    }
    updateService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateServiceDto = (0, class_transformer_1.plainToClass)(service_dto_1.UpdateServiceDto, data);
            const errors = yield (0, class_validator_1.validate)(updateServiceDto);
            if (errors.length > 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_DATA + ': ' + errors.map((err) => Object.values(err.constraints || {})).join(', '), HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const service = yield this._repository.findServiceById(updateServiceDto.id);
            if (!service) {
                throw new cutsomError_1.default(Messages_1.Messages.SERVICE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            const result = yield this._repository.updateService({
                id: updateServiceDto.id,
                name: updateServiceDto.name,
                description: updateServiceDto.description,
            });
            if (!result) {
                throw new cutsomError_1.default(Messages_1.Messages.SERVICE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            return (0, class_transformer_1.plainToClass)(service_dto_1.ServiceDto, {
                id: result._id.toString(),
                name: result.name,
                description: result.description,
            });
        });
    }
    deleteService(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_SERVICE_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const service = yield this._repository.findServiceById(id);
            if (!service) {
                throw new cutsomError_1.default(Messages_1.Messages.SERVICE_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            yield this._repository.deleteService(id);
            return Messages_1.Messages.SERVICE_DELETED;
        });
    }
}
exports.default = SalonMenuService;
