import axios from "axios";
import { ISalon } from "../interfaces/interface";
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

export const updateSalonProfile = async(data:ISalon)=>{
    return await API.put('/salon/profile',data)
}

export const uploadImage =  async(data:FormData)=>{
    return await API.post('/salon/upload-image',data,{
        headers:{
            "Content-Type":"multipart/form-data"
        }
    })
}
export const deleteImage =  async(data:{salonId:string,imageId:string})=>{
    return await API.put('/salon/delete-image',data)
}

export const getSalonData = async(data:{id:string})=>{
    return await API.get('/salon/salon-service',
        {
            params:{id:data.id}
        }
    )
}

export const getAllService = async()=>{
    return await API.get('/salon/service')
}

export const addService =  async(data:{id:string,name:string,description:string,service:string,price:number})=>{
    return await API.put('/salon/add-service',data)
}


export const updateService =  async(data:{salonId:string,serviceId:string,name:string,description:string,price:string})=>{
    return await API.put('/salon/edit-service',data)
}

export const addStylist = async(data:{salon:string,name:string,email:string,phone:string,workingHours:[{day:string,startTime:string,endTime:string,services:[] ,isAvailable:boolean}]})=>{
    return await API.post('/salon/add-stylist',data)
}

export const getStylists = async(data:{id:string,page:number,limit:number,search:string})=>{
    return await API.get('/salon/stylist',{
        params:{id:data.id,page:data.page,limit:data.limit,search:data.search}
    })
}