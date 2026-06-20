"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter_1 = __importDefault(require("./userRouter"));
const adminRouter_1 = __importDefault(require("./adminRouter"));
const salonRouter_1 = __importDefault(require("./salonRouter"));
const authRouter_1 = __importDefault(require("./authRouter"));
const router = (0, express_1.Router)();
// Use the userRouter with prefix '/'
router.use('/', userRouter_1.default);
// Use the adminRouter with prefix '/admin'
router.use('/api/v1/admin', adminRouter_1.default);
// Use the salonRouter with prefix '/salon'
router.use('/api/v1/salon', salonRouter_1.default);
// Use the authRouter with prefix '/auth'
router.use('/auth', authRouter_1.default);
exports.default = router;
