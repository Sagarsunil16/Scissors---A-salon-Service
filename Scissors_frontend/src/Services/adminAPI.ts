import axios from 'axios';

const API = axios.create({
    baseURL: "http://localhost:3000/admin",
    withCredentials: true, // Ensure cookies are sent with the request
});

API.interceptors.request.use((config) => {
    console.log("🟢 Request Sent:", config.url, config);
    return config;
});

API.interceptors.response.use(
    (response) => {
        console.log("🟢 Response Received:", response.config.url, response.status);
        return response;
    },
    async (error) => {
        console.error("🔴 Error Response:", error.config?.url, error.response?.status, error.response?.data);
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn("🔶 401 Unauthorized detected. Trying to refresh token...");
            originalRequest._retry = true;

            try {
                console.log("🔄 Sending refresh token request...");
                const refreshResponse = await axios.post(
                    "http://localhost:3000/auth/refresh-token",
                    {},
                    { withCredentials: true }
                );

                console.log("✅ Refresh Token Success:", refreshResponse.data);

                return API(originalRequest); // Retry the original request
            } catch (refreshError:any) {
                console.error("🔴 Refresh Token Failed:", refreshError.response?.data || refreshError);
                console.log("🔴 Logging out user...");
                await API.post("/signout");
                window.location.href = "/admin/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


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

export const getAllCategory = async()=>{
    return await API.get('/category')
}

export const deleteCategory = async(data:{id:string})=>{
    return await API.put('/delete-category',data)
}
export const addCategory =  async(data:{categoryName:string,categoryDescription:string})=>{
    return await API.post('/addCategory',data)
}

export const editCategory  = async(data:{id:string,name:string,description:string})=>{
    return await API.put('/edit-category',data)
}

export const getAllServices = async(data:{page:number})=>{
    return await API.get('/service',{
        params:{
            page:data.page
        }
    })
}

export const addService = async(data:{name:string,description:string})=>{
    return await API.post('/add-service',data)
}
export const deleteService = async(data:{id:string})=>{
    return await API.delete('/delete-service',{
        params:{id:data.id}
    })
}
export const editService =  async(data:{id:string,name:string,description:string})=>{
    return await API.put('/edit-service',data)
}

