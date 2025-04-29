import mongoose from "mongoose";
import { ICategory, ICategoryDocument } from "./ICategory";

export interface ICategoryRepository {
    findByIdCategory(id:string):Promise<ICategoryDocument | null>
    findByName(name:string | mongoose.Types.ObjectId):Promise<ICategoryDocument | null>
    getAllCategory():Promise<ICategoryDocument[]>;
    createCategory(categoryData: ICategory): Promise<ICategoryDocument>;
    deleteCategory(id:string):Promise<any>
    updateCategory(id:string,updatedData:{name:string,description:string}):Promise<ICategoryDocument | null>
    getCategoriesPaginated(query:any,skip:number,limit:number):Promise<ICategoryDocument[]>
    countCategories(query:any):Promise<number>
  }
  