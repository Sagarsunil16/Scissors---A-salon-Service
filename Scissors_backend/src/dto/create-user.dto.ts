// src/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstname?: string;

    @IsString()
    @IsNotEmpty()
    lastname?: string;

    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsString()
    @MinLength(6)
    password?: string;

}