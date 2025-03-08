import {Request,Response} from 'express'
import { categoryService } from '../config/di'
class CategoryController {

    async getAllCategory(req:Request,res:Response):Promise<any>{
        try {
            const categories =  await categoryService.getAllCategory()
            res.status(200).json({message:"Category fetched Successfully",categories})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal Server Error"})
        }
    }

    async addNewCategory(req:Request,res:Response):Promise<void>{
        try {
           
            const result = await categoryService.createCategory(req.body)
            res.status(200).json({message:"Category created successfully",result})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal server Issue"})
        }
    }

    async editCategory(req:Request,res:Response):Promise<void>{
        try {
            const result = await categoryService.updateCategory(req.body)
            console.log(result)
            res.status(200).json({message:"Category Updated Successfully",result})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal Server Issue"})
        }
    }

    async deleteCategory(req:Request,res:Response):Promise<void>{
        try {
            const result = await categoryService.deleteCategory(req.body.id)
            res.status(200).json({message:"Category deleted Successfully",result})
        } catch (error:any) {
            res.status(500).json({error:error.message || "Internal Server Error"})
        }
    }
}

export default new CategoryController()