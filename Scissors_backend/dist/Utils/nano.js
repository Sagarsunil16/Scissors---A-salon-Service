"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nanoid = void 0;
const nanoid_1 = require("nanoid");
const nanoid = (size = 21) => {
    return (0, nanoid_1.nanoid)(size);
};
exports.nanoid = nanoid;
