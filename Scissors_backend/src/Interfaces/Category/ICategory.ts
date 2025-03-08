import mongoose,{Document} from "mongoose";

export interface ICategory{
    name:string,
    description:string
}
export interface ICategoryDocument extends Document{
    name:string,
    description:string
}