import { IWalletDocument } from "./IWallet";
import { IWalletTransactionDocument } from "./IWalletTransactions";

export interface IWalletService {
getOrCreateWallet(userId: string): Promise<IWalletDocument>;
  creditWallet(
    userId: string,
    amount: number,
    appointmentId?: string,
    description?: string
  ): Promise<IWalletTransactionDocument>;
  debitWallet(
    userId: string,
    amount: number,
    appointmentId?: string,
    description?: string
  ): Promise<IWalletTransactionDocument>;
  getBalance(userId: string): Promise<number>;
  getTransactionHistory(userId: string, page: number, limit: number): Promise<{
    transactions: IWalletTransactionDocument[];
    total: number;
    page: number;
    pages: number;
  }>;
}