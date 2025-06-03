import mongoose from "mongoose";
import { HttpStatus } from "../constants/HttpStatus";
import { Messages } from "../constants/Messages";
import { IWalletDocument } from "../Interfaces/Wallet/IWallet";
import { IWalletService } from "../Interfaces/Wallet/IWalletService";
import CustomError from "../Utils/cutsomError";
import { IWalletTransactionDocument, TransactionType } from "../Interfaces/Wallet/IWalletTransactions";
import { IWalletRepository } from "../Interfaces/Wallet/IWalletRepository";
import { IWalletTransactionRepository } from "../Interfaces/Wallet/IWalletTransactionRepository";

class WalletService implements IWalletService{

    private _walletRepository: IWalletRepository
    private _walletTransactionReposiotry: IWalletTransactionRepository
    constructor(walletRepository:IWalletRepository, walletTransactionRepository:IWalletTransactionRepository){
        this._walletRepository = walletRepository
        this._walletTransactionReposiotry =  walletTransactionRepository
    }


    async getOrCreateWallet(userId: string): Promise<IWalletDocument> {
         if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError(Messages.INVALID_USER_ID, HttpStatus.BAD_REQUEST);
    }
    let wallet = await this._walletRepository.findByUserId(userId);
    if (!wallet) {
      wallet = await this._walletRepository.createWallet(userId);
    }
    return wallet;
    }

    async creditWallet(
    userId: string,
    amount: number,
    appointmentId?: string,
    description: string = "Wallet credit"
  ): Promise<IWalletTransactionDocument> {
    if (amount <= 0) {
      throw new CustomError("Amount must be positive", HttpStatus.BAD_REQUEST);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const wallet = await this.getOrCreateWallet(userId);
      const updatedWallet = await this._walletRepository.updateBalance(
        (wallet._id as mongoose.Types.ObjectId).toString(),
        amount,
        TransactionType.CREDIT,
        session
      );
      const transaction = await this._walletTransactionReposiotry.createTransaction(
       (updatedWallet._id as mongoose.Types.ObjectId).toString(),
        TransactionType.CREDIT,
        amount,
        appointmentId,
        description,
        session
      );
      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async debitWallet(
    userId: string,
    amount: number,
    appointmentId?: string,
    description: string = "Wallet debit"
  ): Promise<IWalletTransactionDocument> {
    if (amount <= 0) {
      throw new CustomError("Amount must be positive", HttpStatus.BAD_REQUEST);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const wallet = await this.getOrCreateWallet(userId);
      if (wallet.balance < amount) {
        throw new CustomError(Messages.INSUFFICIENT_WALLET_BALANCE, HttpStatus.BAD_REQUEST);
      }
      const updatedWallet = await this._walletRepository.updateBalance(
        (wallet._id as mongoose.Types.ObjectId).toString(),
        amount,
        TransactionType.DEBIT,
        session
      );
      const transaction = await this._walletTransactionReposiotry.createTransaction(
        (updatedWallet._id as mongoose.Types.ObjectId).toString(),
        TransactionType.DEBIT,
        amount,
        appointmentId,
        description,
        session
      );
      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  async getTransactionHistory(userId: string, page: number, limit: number): Promise<{
    transactions: IWalletTransactionDocument[];
    total: number;
    page: number;
    pages: number;
  }> {
    if (page < 1 || limit < 1) {
      throw new CustomError(Messages.INVALID_PAGINATION_PARAMS, HttpStatus.BAD_REQUEST);
    }
    const wallet = await this.getOrCreateWallet(userId);
    const { transactions, total } = await this._walletTransactionReposiotry.getTransactions(
     (wallet._id as mongoose.Types.ObjectId).toString(),
      page,
      limit
    );
    return {
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}


export default WalletService