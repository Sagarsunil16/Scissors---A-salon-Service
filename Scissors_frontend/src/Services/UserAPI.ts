import axios from "axios";
import { store } from "../Redux/store";
import { signOut } from "../Redux/User/userSlice";
import { API_ENDPOINTS } from "../Constants";
import { Chat, IMessage } from "../types/Imessage"; // Added IMessage import

const API = axios.create({
  baseURL:  `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
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
          {},
          { withCredentials: true }
        );
        return API(originalRequest);
      } catch (refreshError) {
        await API.post("/signout");
        window.location.href = "/login";
        store.dispatch(signOut());
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      alert("You have been blocked by the admin. Logging out...");
      await API.post("/signout");
      store.dispatch(signOut());
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Existing functions (unchanged)
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
export const resetPassword = async (data: { email: string; password: string }) => {
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
export const googleLogin = async (data: { token: string; refreshToken: string }) => {
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
export const getAvailableSlot = async (data: {
  salonId: string;
  stylistId:String
  serviceIds: string[];
  selectedDate: string;
}) => {
  return await API.post(`/timeslots/available`,data);
};
export const getSalonDetailsWithSlots = async (data: {
  id: string;
  serviceId?: string;
  stylistId?: string;
  selectedDate?: string;
}) => {
  return await API.get("/salon-details", {
    params: {
      id: data.id,
      serviceId: data.serviceId,
      date: data.selectedDate,
      stylistId: data.stylistId,
    },
  });
};
export const fetchServiceStylist = async (data: { salonId: string; serviceIds: string[],date:string }) => {
  return API.get(`/salons/${data.salonId}/stylist`, {
    params: {
      serviceIds: data.serviceIds.join(","),
      date:data.date,
    },
  });
};

export const getSalonReviews = async (salonId: string) => {
  return await API.get(`/salons/${salonId}/reviews`);
};

export const createBooking = async(data:{
  salonId:string;
  stylistId:string;
  serviceIds:string[];
  slotIds:string[];
  startTime:string;
  endTime:string;
  paymentMethod?: "online" | "cash" | "wallet";
  serviceOption: string;
  address?: {
    areaStreet: string;
    city: string;
    state: string;
    pincode: string;
  }
})=>{
  return await API.post('/bookings',data)
}

export const paymentIntentResponse = async (data: {
  amount: number;
  currency: string;
  metadata: Record<string, any>
  reservedUntil: Record<string,any>;
   bookingId:string
}) => {
  return await API.post("/create-checkout-session", data);
};
export const createAppointment = async (data: {
  user: string;
  salon: string;
  stylist: string;
  services: string[];
  slots: string[];
  status: string;
  totalPrice: number;
  paymentStatus: string;
  serviceOption: string;
  address?: {areaStreet:string,city:string,state:string,pincode:string};
 
}) => {
  return await API.post("/appointments", data);
};
export const getUserAppointments = async (data: { page: number; limit: number }) => {
  return await API.get("/appointments", {
    params: {
      page: data.page,
      limit: data.limit,
    },
  });
};
export const cancelAppointment = async (id: string) => {
  return await API.put(`/appointment/cancel/${id}`, {
    params: { id: id },
  });
};
export const getSalons = async (params: {
  longitude?: number;
  latitude?: number;
  radius?: number;
  search?: string;
  maxPrice?: number;
  ratings?: string;
  discount?: number;
  page?: number;
  limit?: number;
  sort?: string; 
}) => {
  const response = await API.get("/salons", { params });
  return response;
};
export const submitReview = async (data: {
  salonId: string;
  stylistId: string;
  appointmentId: string;
  salonRating: number;
  salonComment: string;
  stylistRating: number;
  stylistComment: string;
}) => {
  return await API.post("/reviews", data);
};

// Chat-related functions
export const getChats = async () => {
  return await API.get<{ chats: Chat[]; salons: any[] }>("/chats");
};

export const getMessages = async (salonId: string) => {
  return await API.get<IMessage[]>(`/messages/${salonId}`);
};

export const deleteChat = async (salonId: string) => {
  return await API.delete(`/chats/${salonId}`);
};

export const markMessagesAsRead = async (salonId: string) => {
  return await API.post(`/messages/${salonId}/read`, {});
};

export const addReaction = async (messageId: string, emoji: string) => {
  return await API.post(`/messages/${messageId}/reaction`, { emoji });
};

// Wallet-related functions
export const getWalletBalance = async () => {
  return await API.get("/wallet/balance");
};

export const getWalletTransactions = async (data: { page: number; limit: number }) => {
  return await API.get("/wallet/transactions", { params: data });
};