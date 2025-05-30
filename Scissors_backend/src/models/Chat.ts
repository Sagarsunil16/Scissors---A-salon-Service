import mongoose, {Schema} from "mongoose";
import { IChatDocument } from "../Interfaces/Chat/IChat";

const ChatSchema:Schema  = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    salonId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Salon'
    },
    lastMessage:{
        type:String,
        default:""
    },
    lastActive:{
        type:Date,
        default:Date.now()
    },
    unreadCountUser: { type: Number, default: 0 }, 
    unreadCountSalon: { type: Number, default: 0 },
},{timestamps:true})


export default mongoose.model<IChatDocument>("Chat",ChatSchema)