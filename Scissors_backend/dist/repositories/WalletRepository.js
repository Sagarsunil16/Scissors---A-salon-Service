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
const Wallet_1 = __importDefault(require("../models/Wallet"));
const mongoose_1 = __importDefault(require("mongoose"));
const IWalletTransactions_1 = require("../Interfaces/Wallet/IWalletTransactions");
const Messages_1 = require("../constants/Messages");
const HttpStatus_1 = require("../constants/HttpStatus");
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
class WalletRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Wallet_1.default);
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOne({ user: new mongoose_1.default.Types.ObjectId(userId) });
        });
    }
    createWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.create({ user: new mongoose_1.default.Types.ObjectId(userId), balance: 0 });
            return wallet;
        });
    }
    updateBalance(walletId, amount, type, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.model.findById(walletId).session(session !== null && session !== void 0 ? session : null);
            if (!wallet) {
                throw new cutsomError_1.default(Messages_1.Messages.WALLET_NOT_FOUND, HttpStatus_1.HttpStatus.NOT_FOUND);
            }
            if (type === IWalletTransactions_1.TransactionType.DEBIT && wallet.balance < amount) {
                throw new cutsomError_1.default(Messages_1.Messages.INSUFFICIENT_WALLET_BALANCE, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            wallet.balance = type === IWalletTransactions_1.TransactionType.CREDIT ? wallet.balance + amount : wallet.balance - amount;
            yield wallet.save({ session });
            return wallet;
        });
    }
}
exports.default = WalletRepository;
