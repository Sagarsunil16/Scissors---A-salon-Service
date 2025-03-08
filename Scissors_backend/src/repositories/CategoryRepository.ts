import { ICategory, ICategoryDocument } from "../Interfaces/Category/ICategory";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import Category from "../models/Category";

class CategoryRepository implements ICategoryRepository{
    
    async findByIdCategory(id:String):Promise<ICategoryDocument | null>{
        return await Category.findById(id)
    }

    async findByName(name:string):Promise<ICategoryDocument | null>{
        return await Category.findOne({name:name})
    }

    async getAllCategory():Promise<ICategoryDocument[]>{
        return await Category.find({})
    }

    async createCategory(categoryData: ICategory): Promise<ICategoryDocument> {
        return await Category.create(categoryData)
    }

   async updateCategory(id: string, updatedData: { name: string; description: string; }): Promise<ICategoryDocument | null > {
       return await Category.findOneAndUpdate({_id:id},{...updatedData},{new:true})
   }

    async deleteCategory(id: string): Promise<any> {
        return await Category.findByIdAndDelete(id)
    }
}

export default CategoryRepository