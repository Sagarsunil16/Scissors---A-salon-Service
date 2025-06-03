import mongoose,{Schema,Document} from "mongoose";
import { IWalletTransaction, IWalletTransactionDocument, TransactionType } from "../Interfaces/Wallet/IWalletTransactions";


const WalletTransaction:Schema = new Schema({
    wallet:{
        type:mongoose.Types.ObjectId,
        ref:"Wallet",
        required:true
    },
    type:{
        type:String,
        enum: Object.values(TransactionType),
        required:true
    },
    amount:{
        type:Number,
        required:true,
        min:0
    },
    appointment:{
        type:mongoose.Types.ObjectId,
        ref:"Appointment"
    },
    description:{
        type:String,
        required:true
    }
},{timestamps:true})


export default mongoose.model<IWalletTransactionDocument>("WalletTransaction",WalletTransaction)