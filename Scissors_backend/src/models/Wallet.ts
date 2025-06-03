import mongoose, {Schema , Document} from "mongoose";
import { IWalletDocument } from "../Interfaces/Wallet/IWallet";

const WalletSchema:Schema =  new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    balance:{
        type:Number,
        required:true,
        default:0,
        min:0
    }
},{timestamps:true})

export default mongoose.model<IWalletDocument>("Wallet",WalletSchema);