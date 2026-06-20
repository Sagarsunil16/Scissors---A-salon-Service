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
const mongoose_1 = __importDefault(require("mongoose"));
const HttpStatus_1 = require("../constants/HttpStatus");
const Messages_1 = require("../constants/Messages");
const cutsomError_1 = __importDefault(require("../Utils/cutsomError"));
const IWalletTransactions_1 = require("../Interfaces/Wallet/IWalletTransactions");
class WalletService {
    constructor(walletRepository, walletTransactionRepository) {
        this._walletRepository = walletRepository;
        this._walletTransactionReposiotry = walletTransactionRepository;
    }
    getOrCreateWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_USER_ID, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            let wallet = yield this._walletRepository.findByUserId(userId);
            if (!wallet) {
                wallet = yield this._walletRepository.createWallet(userId);
            }
            return wallet;
        });
    }
    creditWallet(userId_1, amount_1, appointmentId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, amount, appointmentId, description = "Wallet credit") {
            if (amount <= 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_AMOUNT, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const wallet = yield this.getOrCreateWallet(userId);
                const updatedWallet = yield this._walletRepository.updateBalance(wallet._id.toString(), amount, IWalletTransactions_1.TransactionType.CREDIT, session);
                const transaction = yield this._walletTransactionReposiotry.createTransaction(updatedWallet._id.toString(), IWalletTransactions_1.TransactionType.CREDIT, amount, appointmentId, description, session);
                yield session.commitTransaction();
                return transaction;
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
    debitWallet(userId_1, amount_1, appointmentId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, amount, appointmentId, description = "Wallet debit") {
            if (amount <= 0) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_AMOUNT, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const wallet = yield this.getOrCreateWallet(userId);
                if (wallet.balance < amount) {
                    throw new cutsomError_1.default(Messages_1.Messages.INSUFFICIENT_WALLET_BALANCE, HttpStatus_1.HttpStatus.BAD_REQUEST);
                }
                const updatedWallet = yield this._walletRepository.updateBalance(wallet._id.toString(), amount, IWalletTransactions_1.TransactionType.DEBIT, session);
                const transaction = yield this._walletTransactionReposiotry.createTransaction(updatedWallet._id.toString(), IWalletTransactions_1.TransactionType.DEBIT, amount, appointmentId, description, session);
                yield session.commitTransaction();
                return transaction;
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
    getBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            console.log(userId, "userid");
            const wallet = yield this.getOrCreateWallet(userId);
            return wallet.balance;
        });
    }
    getTransactionHistory(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new cutsomError_1.default(Messages_1.Messages.AUTHENTICATION_REQUIRED, HttpStatus_1.HttpStatus.UNAUTHORIZED);
            }
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                throw new cutsomError_1.default(Messages_1.Messages.INVALID_PAGINATION_PARAMS, HttpStatus_1.HttpStatus.BAD_REQUEST);
            }
            const wallet = yield this.getOrCreateWallet(userId);
            const { transactions, total } = yield this._walletTransactionReposiotry.getTransactions(wallet._id.toString(), page, limit);
            return {
                transactions,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        });
    }
}
exports.default = WalletService;
