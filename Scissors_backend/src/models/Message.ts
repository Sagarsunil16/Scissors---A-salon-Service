import mongoose , {Schema,Document} from "mongoose";
import { IMessageDocument } from "../Interfaces/Messages/IMessage";


const MessageSchema: Schema = new Schema({
    chatId:{type:Schema.Types.ObjectId,required:true, ref:"Chat"},  //link to chat
    content: { type: String, required: false }, // Make optional for image-only messages
    senderType: { type: String, enum: ["User", "Salon"], required: true },
    senderId: { type: Schema.Types.ObjectId, required: true, refPath: 'senderType' },
    recipientId: { type: Schema.Types.ObjectId, required: true, refPath: 'recipientType' },
    recipientType: { type: String, enum: ["User", "Salon"], required: true },
    image:{type:String,default:""},
    timestamp: { type: Date, default: Date.now },
    isRead:{type:Boolean,default:false},  //track read status
    reactions:[{userId:Schema.Types.ObjectId,emoji:String}] //store reactions 
  },{timestamps:true});
  

  export default mongoose.model<IMessageDocument>("Message",MessageSchema)