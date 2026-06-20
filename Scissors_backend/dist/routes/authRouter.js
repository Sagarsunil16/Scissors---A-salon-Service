"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const di_1 = require("../container/di");
const authRouter = (0, express_1.Router)();
// Public route
authRouter.post('/refresh-token', di_1.authController.refreshToken.bind(di_1.authController));
exports.default = authRouter;
