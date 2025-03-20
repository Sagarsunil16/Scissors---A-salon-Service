import {NextFunction, Request,Response} from 'express'
import { categoryService } from '../config/di'
import CustomError from '../Utils/cutsomError'
class CategoryController {

    async getAllCategory(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const categories =  await categoryService.getAllCategory()
            res.status(200).json({message:"Category fetched Successfully",categories})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to fetch categories. Please try again later.", 500));
        }
    }

    async addNewCategory(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
           
            const result = await categoryService.createCategory(req.body)
            res.status(200).json({message:"Category created successfully",result})
        } catch (error:any) {
            next(new CustomError(error.message || "There was an issue while creating the category. Please try again.", 500));
        }
    }

    async editCategory(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const result = await categoryService.updateCategory(req.body)
            res.status(200).json({message:"Category Updated Successfully",result})
        } catch (error:any) {
            next(new CustomError(error.message || "There was an issue updating the category. Please try again.", 500));
        }
    }

    async deleteCategory(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const result = await categoryService.deleteCategory(req.body.id)
            res.status(200).json({message:"Category deleted Successfully",result})
        } catch (error:any) {
            next(new CustomError(error.message || "There was an issue deleting the category. Please try again.", 500));
        }
    }
}

export default new CategoryController()