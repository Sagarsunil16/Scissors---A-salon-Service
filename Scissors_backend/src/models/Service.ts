import mongoose,{Schema ,Document} from "mongoose";
import { IServiceDocument } from "../Interfaces/Service/IService";

const serviceSchema:Schema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true,
    }
})


export default mongoose.model<IServiceDocument>("Service",serviceSchema)