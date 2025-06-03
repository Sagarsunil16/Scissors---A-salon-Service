import mongoose from "mongoose";
import { IWalletDocument } from "./IWallet";
import { IWalletTransactionDocument, TransactionType } from "./IWalletTransactions";

export interface IWalletRepository {
    findByUserId(userId: string): Promise<IWalletDocument | null>;
    createWallet(userId: string): Promise<IWalletDocument>;
    updateBalance(
    walletId: string,
    amount: number,
    type: TransactionType,
    session?: mongoose.ClientSession
  ): Promise<IWalletDocument>;

}