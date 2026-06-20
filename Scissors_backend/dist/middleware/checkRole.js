"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (userRole && allowedRoles.includes(userRole)) {
            next();
        }
        else {
            res.status(403).json({ message: "Forbidden:Insufficient permissions" });
        }
    };
};
exports.default = checkRole;
