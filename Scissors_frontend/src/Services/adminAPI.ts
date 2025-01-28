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

export const blockAndUnblock = async(data:{userId:string,isActive:Boolean})=>{
    return await API.put('/block-unblock',data)
}

export const deleteUserAPI =  async(data:{id:string})=>{
    return await API.post('/delete-user',data)
}