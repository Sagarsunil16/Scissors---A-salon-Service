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
const BaseRepository_1 = require("./BaseRepository");
const WalletTransaction_1 = __importDefault(require("../models/WalletTransaction"));
const mongoose_1 = __importDefault(require("mongoose"));
class WalletTransactionRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(WalletTransaction_1.default);
    }
    createTransaction(walletId, type, amount, appointmentId, description, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this.model.create([{
                    wallet: new mongoose_1.default.Types.ObjectId(walletId),
                    type,
                    amount,
                    appointment: appointmentId ? new mongoose_1.default.Types.ObjectId(appointmentId) : undefined,
                    description
                }], { session });
            return transaction[0];
        });
    }
    getTransactions(walletId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const [transactions, total] = yield Promise.all([
                    this.model.find({ wallet: new mongoose_1.default.Types.ObjectId(walletId) })
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .lean(),
                    this.model.countDocuments({ wallet: new mongoose_1.default.Types.ObjectId(walletId) })
                ]);
                return { transactions, total };
            }
            catch (error) {
                console.error("Error in getTransactions:", error);
                throw error;
            }
        });
    }
}
exports.default = WalletTransactionRepository;
