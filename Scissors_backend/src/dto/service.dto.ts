import { Expose } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsString, MinLength } from "class-validator";


export class ServiceDto{
    @Expose()
    _id!:string;

    @Expose()
    name!:string

    @Expose()
    description!:string

}


export class CreateServiceDto{
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name!:string

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    description!:string
}


export class UpdateServiceDto{
    @IsMongoId()
    @IsNotEmpty()
    id!:string


    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name!:string

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    description!:string
}