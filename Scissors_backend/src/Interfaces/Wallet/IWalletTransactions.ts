import mongoose,  {Document} from  "mongoose";


export enum TransactionType{
    CREDIT = "credit",
    DEBIT = "debit"
}
export interface IWalletTransaction{
    wallet:mongoose.Types.ObjectId,
    type:TransactionType,
    amount:number,
    appointment?:mongoose.Types.ObjectId;
    description:string,
    createdAt:Date;
}

export interface IWalletTransactionDocument extends IWalletTransaction, Document{}