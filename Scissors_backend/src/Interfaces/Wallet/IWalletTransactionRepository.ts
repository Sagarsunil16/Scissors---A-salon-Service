import mongoose from "mongoose";
import { IWalletTransactionDocument, TransactionType } from "./IWalletTransactions";

export interface IWalletTransactionRepository{
    createTransaction(
    walletId: string,
    type: TransactionType,
    amount: number,
    appointmentId?: string,
    description?: string,
    session?: mongoose.ClientSession
  ): Promise<IWalletTransactionDocument
  >;
  getTransactions(walletId: string, page: number, limit: number): Promise<{
    transactions: IWalletTransactionDocument[];
    total: number;
  }>;
}