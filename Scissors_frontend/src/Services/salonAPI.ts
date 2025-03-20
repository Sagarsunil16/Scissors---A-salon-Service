import axios from "axios";
import { ISalon } from "../interfaces/interface";
const API =  axios.create({
    baseURL:`${import.meta.env.VITE_API_URL}/salon`,
    withCredentials: true,
})

export const signUpSalon = async(data:any)=>{
    return await API.post('/register',data)
}
export const sentOtp = async(data:{email:string})=>{
    return await API.post('/otp',data)
}
export const verifyOtp = async(data:{email:string,otp:string})=>{
    return await API.put("/verify",data)
}

export const resentOtp = async(data:{email:string})=>{
    return await API.post("/resent-otp",data)
}

export const loginSalon = async(data:{email:string,password:string})=>{
    return await API.post("/login",data)
}

export const signOutSalon = async()=>{
    return await API.post('/signout')
}

export const updateSalonProfile = async(data:ISalon)=>{
    return await API.put('/profile',data)
}

export const uploadImage =  async(data:FormData)=>{
    return await API.post('/upload-image',data,{
        headers:{
            "Content-Type":"multipart/form-data"
        }
    })
}
export const deleteImage =  async(data:{salonId:string,imageId:string})=>{
    return await API.put('/delete-image',data)
}

export const getSalonData = async(data:{id:string})=>{
    return await API.get('/salon-service',
        {
            params:{id:data.id}
        }
    )
}

export const getAllService = async()=>{
    return await API.get('/service')
}

export const addService =  async(data:{id:string,name:string,description:string,service:string,price:number})=>{
    return await API.put('/add-service',data)
}


export const updateService =  async(data:{salonId:string,serviceId:string,name:string,description:string,price:string})=>{
    return await API.put('/edit-service',data)
}

export const addStylist = async(data:{salon:string,name:string,email:string,phone:string,workingHours:[{day:string,startTime:string,endTime:string,services:[] ,isAvailable:boolean}]})=>{
    return await API.post('/add-stylist',data)
}

export const getStylists = async(data:{id:string,page?:number,limit?:number,search?:string})=>{
    return await API.get('/stylist',{
        params:{id:data.id,page:data.page??1,limit:data.limit??10,search:data.search??''}
    })
}

export const deleteStylist = async(id:string)=>{
    return await API.delete(`/stylist/${id}`)
}

export const getStylistById = async(id:string)=>{
    return await API.get(`/stylist/${id}`);
}

export const updateStylist = async(id:string,data:{name:string,email:string,phone:string,available:boolean,workingHours:{startTime:string,endTime:string}[]})=>{
    return await API.put(`/stylist/edit/${id}`,data)
}

export const deleteService = async(data:{serviceId:string,salonId:string})=>{
    return await API.put('/delete-service',data)
}