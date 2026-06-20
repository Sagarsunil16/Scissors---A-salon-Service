"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const di_1 = require("../container/di");
const router = (0, express_1.Router)();
router.post('/', express_2.default.raw({ type: 'application/json' }), di_1.bookingController.webHooks.bind(di_1.bookingController));
exports.default = router;
