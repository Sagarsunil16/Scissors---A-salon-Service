import axios from "axios";

const API =  axios.create({
    baseURL:"http://localhost:3000"
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
