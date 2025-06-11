// src/dto/user.dto.ts
import { Expose, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AddressDto {
  @Expose()
  areaStreet!: string | null;

  @Expose()
  city!: string | null;

  @Expose()
  state!: string | null;

  @Expose()
  pincode!: string | null;
}

export class UserDto {
  @Expose()
  _id!: string;

  @Expose()
  firstname!: string;

  @Expose()
  lastname!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string;

  @Expose()
  @Type(() => AddressDto)
  address!: AddressDto;

  @Expose()
  role!: 'User' | 'Admin';

  @Expose()
  is_Active!: boolean;

  @Expose()
  verified!: boolean;

  @Expose()
  googleLogin!: boolean;
}


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