import mongoose, {Schema} from "mongoose";
import { ICategoryDocument } from "../Interfaces/Category/ICategory";


const categoryModel:Schema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    }
},{timestamps:true})


export default mongoose.model<ICategoryDocument>("Category",categoryModel)