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
    userData: User[]; // Array of user objects
    loading: boolean;
    error: boolean | string;
  }
  

  export interface salon{
    salonName:string,
    email:string,
    password:string,
    phone:number,
    address:Address,
    openingTime:string,
    closingTime:string
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