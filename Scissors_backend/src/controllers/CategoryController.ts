import {NextFunction, Request,Response} from 'express'
import { categoryService } from '../config/di'
import CustomError from '../Utils/cutsomError'
class CategoryController {

    async getAllCategory(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            // const {page,limit,search} = req.params
            const categories =  await categoryService.getAllCategory()
            res.status(200).json({message:"Category fetched Successfully",categories})
        } catch (error:any) {
            next(new CustomError(error.message || "Failed to fetch categories. Please try again later.", 500));
        }
    }
    async getFilteredCategory(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
            const {page=1,limit=10,search=''} = req.query
            const pageNumber = parseInt(page.toString(), 10);
            const limitNumber = parseInt(limit.toString(), 10);
            const result = await categoryService.getFilteredCategory(pageNumber,limitNumber,search as string)
            res.status(200).json({
                message: "Category fetched Successfully",
                categories: result.categories,
                Pagination: {
                  totalItems: result.totalItems,
                  totalPages: Math.ceil(result.totalItems / limitNumber),
                  currentPage: pageNumber
                }
              });
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