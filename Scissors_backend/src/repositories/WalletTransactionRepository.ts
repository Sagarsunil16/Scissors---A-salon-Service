import { IWalletTransactionRepository } from "../Interfaces/Wallet/IWalletTransactionRepository";
import { IWalletTransactionDocument, TransactionType } from "../Interfaces/Wallet/IWalletTransactions";
import { BaseRepository } from "./BaseRepository";
import WalletTransaction from "../models/WalletTransaction";
import mongoose, { ClientSession } from "mongoose";

class WalletTransactionRepository extends BaseRepository<IWalletTransactionDocument> implements IWalletTransactionRepository{
    constructor(){
        super(WalletTransaction)
    }
    async createTransaction(walletId: string, type: TransactionType, amount: number, appointmentId?: string, description?: string, session?: ClientSession): Promise<IWalletTransactionDocument> {
        const transaction = await this.model.create([{
            wallet: new mongoose.Types.ObjectId(walletId),
            type,
            amount,
            appointment: appointmentId? new mongoose.Types.ObjectId(appointmentId) : undefined,
            description
    }],
    {session})
    return transaction[0];
    }

    async getTransactions(walletId: string, page: number, limit: number) {
    try {
        const skip = (page-1) * limit;
        const [transactions, total] = await Promise.all([
            this.model.find({wallet: new mongoose.Types.ObjectId(walletId)})
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .lean(),
            this.model.countDocuments({wallet: new mongoose.Types.ObjectId(walletId)})
        ]);
        return {transactions, total};
    } catch (error) {
        console.error("Error in getTransactions:", error);
        throw error;
    }
}
}


export default WalletTransactionRepository