import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,  // This ensures cookies are sent with requests
    
})

export const loginUser = async(data:{email:string,password:string})=>{
    return await API.post('/login',data)
}
export const signUpUser = async(data:any)=>{
    return await API.post('/signup',data)
}

export const forgotPassword = async(data:{email:string})=>{
    return await API.post('/forgot-password',data)
}

export const sentOTP = async(email:string)=>{
    return await API.post('/otp',{email})
}

export const resendOTP = async(data:{email:string})=>{
    return await API.put('/resend-otp',data)
}

export const verifyOTP = async(data:{email:string,otp:string})=>{
    return await API.post('/verify-otp',data)
}

export const resetPassword = async(data:{email:string,password:string})=>{
    return await API.put('/reset-password',data)
}

export const updateUser = async(data:{id:string,firstname:string,lastname:string,address:{areaStreet: string;
    city: string;
    state: string;
    pincode: string;}})=>{
    return await API.put('/profile',data)
}

export const changePassword = async(data:{currentPassword:string,newPassword:string})=>{
    return await API.put('change-password',data)
}

export const googleLogin =  async(data:{token:string})=>{
    return  await API.post('/auth/google',data)
}

export const LogOut = async()=>{
    return await API.post('/signout')
}