import mongoose , {Document} from "mongoose";

export interface IWallet {
    user: mongoose.Types.ObjectId,
    balance: number,
    createdAt: Date;
    updatedAt: Date;
}

export interface IWalletDocument extends IWallet, Document{}