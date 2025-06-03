import { IWalletDocument } from "../Interfaces/Wallet/IWallet";
import { IWalletRepository } from "../Interfaces/Wallet/IWalletRepository";
import { BaseRepository } from "./BaseRepository";
import Wallet from "../models/Wallet";
import mongoose, { mongo } from "mongoose";
import { IWalletTransactionDocument, TransactionType } from "../Interfaces/Wallet/IWalletTransactions";
import { Messages } from "../constants/Messages";
import { HttpStatus } from "../constants/HttpStatus";
import CustomError from "../Utils/cutsomError";
class WalletRepository extends BaseRepository<IWalletDocument> implements IWalletRepository{
    constructor(){
        super(Wallet)
    }

    async findByUserId(userId: string): Promise<IWalletDocument | null> {
        return await this.findOne({user: new mongoose.Types.ObjectId(userId)})
    }

    async createWallet(userId: string): Promise<IWalletDocument> {
        const wallet =  await this.create({user:new mongoose.Types.ObjectId(userId),balance:0})
        return wallet
    }

    async updateBalance(walletId: string, amount: number, type: TransactionType, session?: mongoose.ClientSession): Promise<IWalletDocument> {
        const wallet = await this.model.findById(walletId).session(session ?? null);
         if (!wallet) {
      throw new CustomError(Messages.WALLET_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (type === TransactionType.DEBIT && wallet.balance < amount) {
      throw new CustomError(Messages.INSUFFICIENT_WALLET_BALANCE, HttpStatus.BAD_REQUEST);
    }
    wallet.balance = type === TransactionType.CREDIT ? wallet.balance + amount : wallet.balance - amount;
    await wallet.save({ session });
    return wallet;
    }

}

export default WalletRepository