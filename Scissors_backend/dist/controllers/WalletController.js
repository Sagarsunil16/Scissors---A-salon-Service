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
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus_1 = require("../constants/HttpStatus");
const Messages_1 = require("../constants/Messages");
class WalletController {
    constructor(walletService) {
        this._walletService = walletService;
    }
    getBalance(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log(userId, "userid");
                const balance = yield this._walletService.getBalance(userId);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.WALLET_BALANCE_FETCHED,
                    data: { balance },
                });
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    getTransactionHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { page = "1", limit = "10" } = req.query;
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
                const history = yield this._walletService.getTransactionHistory(userId, pageNumber, limitNumber);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: Messages_1.Messages.WALLET_HISTORY_FETCHED,
                    data: history,
                });
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
}
exports.default = WalletController;
