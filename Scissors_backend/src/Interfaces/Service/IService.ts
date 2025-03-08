import mongoose,{Document} from "mongoose"
export interface IService {
    name:string,
    description:string,
}
export interface IServiceDocument extends Document {
    name:string,
    description:string,
}