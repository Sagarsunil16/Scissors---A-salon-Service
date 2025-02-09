import axios from 'axios';

const API = axios.create({
    baseURL:'http://localhost:3000/admin',
    withCredentials: true,
})

export const loginAdmin = async(data:{email:string,password:string})=>{
    return await API.post('/login',data)
}

export const signOutAdmin = async()=>{
    return await API.post('/signout')
}

export const UpdateProfile = async(data:{id:string,firstname:string,lastname:string,phone:string})=>{
    return await API.put('/profile',data)
}

export const updatePassword =  async(data:{id:string,currentPassword:string,newPassword:string})=>{
    return await API.put('/change-password',data)
}

export const blockAndUnblockUser = async(data:{userId:string,isActive:Boolean})=>{
    return await API.put('/block-unblock',data)
}

export const fetchUsers = async(data:{page:number,limit:number})=>{
    return await API.post('/users',data)
}

export const fetchSalons = async(data:{page:number})=>{
    return await API.post('/salons',data)
}

export const blockAndUnblockSalon = async(data:{salonId:string,isActive:boolean})=>{
    return await API.put('/salon/block-unblock',data)
}

export const getTotalPagesUser = async()=>{
    return await API.post('/totalPages')
}

export const deleteUserAPI =  async(data:{id:string})=>{
    return await API.post('/delete-user',data)
}

