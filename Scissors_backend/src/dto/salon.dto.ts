import { Expose, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min, MinLength, ValidateNested } from "class-validator";

export class AddressDto{
    @Expose()
    @IsString()
    @IsNotEmpty()
    areaStreet!:string

    @Expose()
    @IsString()
    @IsNotEmpty()
    city!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    state!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    pincode!: string;

    @Expose()
    @IsOptional()
    location?: {
        type: string;
        coordinates: number[];
    };
}


export class SalonServiceDto {
  @Expose()
  @IsMongoId()
  _id!: string;

  @Expose()
  @IsMongoId()
  service!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Expose()
  @IsNumber()
  @Min(0)
  price!: number;

  @Expose()
  @IsInt()
  @Min(1)
  duration!: number;

  @Expose()
  @IsArray()
  @IsMongoId({ each: true })
  stylists!: string[];
}

export class ImageDto {
  @Expose()
  @IsString()
  id!: string;

  @Expose()
  @IsString()
  url!: string;
}

export class SalonDto {
  @Expose()
  _id!: string;

  @Expose()
  @IsString()
  salonName!: string;

  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsNumber()
  phone!: number;

  @Expose()
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @Expose()
  @IsString()
  role?:string

  @Expose()
  @IsMongoId()
  category!: string;

  @Expose()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm)' })
  openingTime!: string;

  @Expose()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm)' })
  closingTime!: string;

  @Expose()
  @IsNumber()
  @Min(0)
  rating!: number;

  @Expose()
  @IsInt()
  @Min(0)
  reviewCount!: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images!: ImageDto[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalonServiceDto)
  services!: SalonServiceDto[];

  @Expose()
  @IsBoolean()
  verified!: boolean;

  @Expose()
  @IsBoolean()
  is_Active!: boolean;

  @Expose()
  @IsString()
  timeZone!:string
}

export class CreateSalonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  salonName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @IsString()
  @IsNotEmpty()
  category!: string;
}


export class UpdateSalonDto {
  @IsMongoId()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  salonName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;   

  @IsNumber()
  @IsNotEmpty()
  phone!: number;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @IsMongoId()
  @IsNotEmpty()
  @IsOptional()
  category!: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm)' })
  openingTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm)' })
  closingTime?: string;

  @IsString()
  @IsNotEmpty()
  timeZone!: string;
}



export class AddServiceDto {
  @IsMongoId()
  @IsNotEmpty()
  salonId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsMongoId()
  @IsNotEmpty()
  service!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  stylists?: string[];
}


export class UpdateServiceDto {
  @IsMongoId()
  @IsNotEmpty()
  salonId!: string;

  @IsMongoId()
  @IsNotEmpty()
  serviceId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsMongoId()
  @IsNotEmpty()
  service!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsArray()
  @IsMongoId({ each: true })
  stylists!: string[];
}

export class LoginSalonDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}