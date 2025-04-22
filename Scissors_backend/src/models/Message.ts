import mongoose , {Schema,Document} from "mongoose";
import { IMessageDocument } from "../Interfaces/Messages/IMessage";


const MessageSchema: Schema = new Schema({
    content: { type: String, required: false }, // Make optional for image-only messages
    senderType: { type: String, enum: ["User", "Salon"], required: true },
    senderId: { type: Schema.Types.ObjectId, required: true, refPath: 'senderType' },
    recipientId: { type: Schema.Types.ObjectId, required: true, refPath: 'recipientType' },
    recipientType: { type: String, enum: ["User", "Salon"], required: true },
    image:{type:String,default:""},
    timestamp: { type: Date, default: Date.now },
  },{timestamps:true});
  

  export default mongoose.model<IMessageDocument>("Message",MessageSchema)