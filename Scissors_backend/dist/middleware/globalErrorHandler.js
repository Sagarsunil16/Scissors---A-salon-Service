"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const globalErrorHandler = (err, req, res, next) => {
    if (err instanceof cutsomError_1.default) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }
    console.log(err);
    return res.status(500).json({
        error: "Something went wrong. Please try again later."
    });
};
exports.default = globalErrorHandler;
