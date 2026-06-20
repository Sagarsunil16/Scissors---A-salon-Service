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
const class_validator_1 = require("class-validator");
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
function validateDto(dtoClass) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const dto = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
            const errors = yield (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                console.error("Validation Errors:", errors);
                return next(new cutsomError_1.default(Messages_1.Messages.INVALID_USER_DATA, HttpStatus_1.HttpStatus.BAD_REQUEST));
            }
            req.body = dto;
            next();
        }
        catch (err) {
            console.log(err, "dto validation error");
            next(err); // This also handles unexpected internal errors
        }
    });
}
exports.default = validateDto;
