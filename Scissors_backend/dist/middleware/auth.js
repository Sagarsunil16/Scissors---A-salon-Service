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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const di_1 = require("../container/di");
const constants_1 = require("../constants");
const auth = (roles, requireEntity = false) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = req.cookies.authToken;
            if (!token) {
                res.status(401).json({ message: 'No token provided, authorization denied' });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!roles.includes(decoded.role)) {
                res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
                return;
            }
            let entity;
            if (requireEntity) {
                if (decoded.role === constants_1.ROLES.USER || decoded.role === constants_1.ROLES.ADMIN) {
                    entity = yield di_1.userService.getUserById(decoded.id);
                    if (!entity) {
                        res.status(404).json({ message: 'User not found' });
                        return;
                    }
                    if (!entity.is_Active) {
                        res.status(403).json({ message: 'Access denied. User is blocked.' });
                        return;
                    }
                }
                else if (decoded.role === constants_1.ROLES.SALON) {
                    entity = yield di_1.salonService.findSalon(decoded.id);
                    if (!entity) {
                        res.status(404).json({ message: 'Salon not found' });
                        return;
                    }
                    if (!entity.is_Active) {
                        res.status(403).json({ message: 'Access denied. Salon is blocked.' });
                        return;
                    }
                }
            }
            req.user = { id: decoded.id, role: decoded.role, entity };
            next();
        }
        catch (error) {
            console.log(error);
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }
    });
};
exports.default = auth;
