// Address interface
export interface Address {
    areaStreet: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    _id: string;
  }
  
  // User interface
  export interface User {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: number;
    password: string;
    role: string;
    is_Active: string;
    otp: string | null;
    otpExpiry: string | null; // Use Date if parsed into a Date object
    __v: number;
    address: Address; // Nested address object
  }
  
  // AdminState interface
  export interface AdminState {
    currentUser:{}
    userData :{
      userData:User[],
      totalUserPages:string
  };
  salonData:{
    salonData:ISalon[],
    totalSalonPages:string
}
    loading: boolean;
    error: boolean | string;
  }
  

  export interface ISalon{
    _id: string;
    salonName:string,
    email:string,
    password:string,
    phone:number,
    address:Address,
    openingTime:string,
    closingTime:string,
    is_Active:boolean,
    verified:boolean,
    images:Array<{id:string,url:string}>
    services:Array<{service:string,
      name:string,
      description:string,
      price:number
    }>
    rating:number
  }

  export interface UserSignInProps{
    title:string,
    onSubmit:(values:{email:string,password:string})=>Promise<void>,
    redirectPath:string
  } 

  export interface OTPVerificationProps {
    resendOTP: (data:{email: string }) => Promise<any>;
    verifyOTP: (data: { email: string; otp: string }) => Promise<any>;
    redirectPath:string
  }

  export interface TableProps{
    columns:{header:string,accessor:string}[];
    data:any[];
    actions?:{
      label:string,
      className:string,
      onClick:(row:any)=>void,
      isDynamic:boolean
    }[],
  }

  export interface Category {
    _id: string;
    name: string;
    description: string;
  }
  

  export interface IService{
    _id:string,
    name:string,
    description:string
  }

  export interface ISalonService{
    _id:string,
    name:string,
    description:string,
    price:number
  }

  export interface IStylist{
    _id:string,
    name:string,
    salon:string,
    email:string,
    phone:string,
    workingHours:Array<{day:string,startTime:string,endTime:string}>
    services:Array<{name:string,description:string}>,
    isAvailable:boolean
  }

  export interface WorkingHours {
    day: string;
    startTime: string;
    endTime: string;
  }
  