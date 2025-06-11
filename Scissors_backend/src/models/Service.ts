import mongoose,{Schema ,Document} from "mongoose";
import { IServiceDocument } from "../Interfaces/Service/IService";

const serviceSchema:Schema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    }
},{timestamps:true})


export default mongoose.model<IServiceDocument>("Service",serviceSchema)