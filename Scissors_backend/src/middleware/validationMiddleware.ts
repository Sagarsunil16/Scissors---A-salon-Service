import { plainToClass, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import CustomError from '../Utils/cutsomError';
import { Messages } from '../constants/Messages';
import { HttpStatus } from '../constants/HttpStatus';

function validateDto(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
      const dto = plainToInstance(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        console.error("Validation Errors:", errors);
        return next(new CustomError(Messages.INVALID_USER_DATA, HttpStatus.BAD_REQUEST));
      }

      req.body = dto;
      next();
    } catch (err) {
      console.log(err,"dto validation error")
      next(err); // This also handles unexpected internal errors
    }
    };
}

export default validateDto