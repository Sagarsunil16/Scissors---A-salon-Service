import mongoose ,{Document} from "mongoose";

export interface IStylist{
  _id:mongoose.Types.ObjectId
    name:string;
    salon:mongoose.Types.ObjectId;
    email:string;
    phone:string;
    workingHours:{
        day:string,
        startTime:string,
        endTime:String
    }[];
    services:string[];
    isAvailable:boolean,
    rating:number,
    reviewCount:number

}

export interface IStylistDocument extends Document{
   
    name:string;
    salon:mongoose.Types.ObjectId;
    email:string;
    phone:string;
    workingHours:{
        day:string,
        startTime:string,
        endTime:String
    }[];
    services:string[];
    isAvailable:boolean,
    rating:number,
    reviewCount:number
   
}

export interface PaginationOptions {
    page: number;
    limit: number;
  }

  export interface PaginationResult<T> {
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }