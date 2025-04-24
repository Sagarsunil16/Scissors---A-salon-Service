import axios from "axios";
import { store } from "../Redux/store";
import { signOut } from "../Redux/User/userSlice";
import { API_ENDPOINTS } from '../Constants';
const API = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  withCredentials: true, // This ensures cookies are sent with requests
});

API.interceptors.request.use((config) => {
  const token = document.cookie
    .split(";")
    .find((row) => row.trim().startsWith("authToken"))
    ?.split("=")[1];
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
          // "http://localhost:3000/refresh-token",
          {},
          {
            withCredentials: true,
          }
        );

        return API(originalRequest);
      } catch (refreshError) {
        await API.post("/signout");
        window.location.href = "/login";
         store.dispatch(signOut())
        return Promise.reject(refreshError);
      }
    }

    if(error.response?.status===403){
      alert("You have been blocked by the admin. Logging out...");
      await API.post('/signout')
      store.dispatch(signOut())
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (data: { email: string; password: string }) => {
  return await API.post("/login", data);
};
export const signUpUser = async (data: any) => {
  return await API.post("/signup", data);
};

export const forgotPassword = async (data: { email: string }) => {
  return await API.post("/forgot-password", data);
};

export const sentOTP = async (email: string) => {
  return await API.post("/otp", { email });
};

export const resendOTP = async (data: { email: string }) => {
  return await API.put("/resend-otp", data);
};

export const verifyOTP = async (data: { email: string; otp: string }) => {
  return await API.post("/verify-otp", data);
};

export const resetPassword = async (data: {
  email: string;
  password: string;
}) => {
  return await API.put("/reset-password", data);
};

export const updateUser = async (data: {
  id: string;
  firstname: string;
  lastname: string;
  address: { areaStreet: string; city: string; state: string; pincode: string };
}) => {
  return await API.put("/profile", data);
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  return await API.put("change-password", data);
};

export const googleLogin = async (data: { token: string,refreshToken:string }) => {
  return await API.post("/auth/google", data);
};

export const LogOut = async () => {
  return await API.post("/signout");
};

export const getAllSalons = async (params: URLSearchParams) => {
  return await API.get("/salons", { params });
};

export const getSalonDetails = async (id: string) => {
  return await API.get("/salon-details", {
    params: { id: id },
  });
};

export const getAvailableSlot = async(data:{id:string,serviceId:string,selectedDate:string})=>{
  return await API.get(`/available-slot/${data.id}/${data.serviceId}?date=${data.selectedDate}`)
}

export const getSalonDetailsWithSlots = async (data: { id: string; serviceId?: string;
  stylistId?:string; selectedDate?: string }) => {
  return await API.get("/salon-details", {
      params: {
          id: data.id,
          serviceId: data.serviceId,
          date: data.selectedDate,
          stylistId:data.stylistId
      },
  });
};
export const fetchServiceStylist = async(data:{salonId:string,serviceIds:string[]})=>{
  return API.get(`/salons/${data.salonId}/stylist`,{
    params: {
      serviceIds: data.serviceIds.join(','), // Convert array to comma-separated string
  },
  })
}

export const getSalonReviews = async(salonId:string)=>{
  return await API.get(`/salons/${salonId}/reviews`)
}

export const paymentIntentResponse = async(data:{amount:number,currency:string,metadata:Record<string,any>})=>{
    return await API.post('/create-checkout-session',data)
}

export const createAppointment = async(data:{user:string,salon:string,stylist:string[],services:string[],slot:string,status:string,totalPrice:number,paymentStatus:string,serviceOption:string,address?:string})=>{
  return await API.post('/appointments',data)
}

export const getUserAppointments = async(data:{page:number,limit:number})=>{
  return await API.get('/appointments',{
    params:{
      page:data.page,
      limit:data.limit
    }
  })
}

export const getChats = async()=>{
  return await API.get(`/user/chats`)
}

export const cancelAppointment = async(id:string)=>{
  return await API.put(`/appointment/cancel/${id}`,{
    params:{
      id:id
    }
  })
}

export const getSalons = async(longitude:number,latitude:number)=>{
  return await API.post('/salons/nearby',{
    longitude,
    latitude,
    radius:5000
  })
}

export const submitReview = async(data:{salonId:string,stylistId:string,appointmentId:string,salonRating:number,salonComment:string,stylistRating:number,stylistComment:string})=>{
  return await API.post('/reviews',data)
}