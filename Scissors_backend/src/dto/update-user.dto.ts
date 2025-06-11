// src/dto/update-user.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    id?: string; 

    @IsString()
    @IsNotEmpty()
    firstname?: string;

    @IsString()
    @IsNotEmpty()
    lastname?: string;

    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsOptional()
    address?: {
        areaStreet: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
    };
}