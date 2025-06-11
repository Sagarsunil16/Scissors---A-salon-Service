import { Expose } from "class-transformer";
import { IsString,IsNotEmpty, MinLength } from "class-validator";

export class CategoryDto{
    @Expose()
    _id?:string;

    @Expose()
    name?:string;

    @Expose()
    description?:string
}

export class CreateCategoryDto{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name!:string

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    description!:string

}

export class UpdateCategoryDto{
    @IsString()
    @IsNotEmpty()
    id?:string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name!:string

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    description!:string
}