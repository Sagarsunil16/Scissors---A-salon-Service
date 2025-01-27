import axios from 'axios';

const API = axios.create({
    baseURL:'http://localhost:3000/admin'
})

export const loginAdmin = async(data:{email:string,password:string})=>{
    return await API.post('/login',data)
}