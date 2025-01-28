import axios from "axios";
import { salon } from "../interfaces/interface";
const API =  axios.create({
    baseURL:"http://localhost:3000",
    withCredentials: true,
})

export const signUpSalon = async(data:any)=>{
    return await API.post('/salon/register',data)
}
export const sentOtp = async(data:{email:string})=>{
    return await API.post('/salon/otp',data)
}
export const verifyOtp = async(data:{email:string,otp:string})=>{
    return await API.put("/salon/verify",data)
}

export const resentOtp = async(data:{email:string})=>{
    return await API.post("/salon/resent-otp",data)
}

export const loginSalon = async(data:{email:string,password:string})=>{
    return await API.post("/salon/login",data)
}

export const signOutSalon = async()=>{
    return await API.post('/salon/signout')
}

export const updateSalonProfile = async(data:salon)=>{
    return await API.put('/salon/profile',data)
}
