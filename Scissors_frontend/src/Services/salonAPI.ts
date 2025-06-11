import axios from "axios";
import { ISalon } from "../interfaces/interface";
import { API_ENDPOINTS } from "../Constants";
import { store } from "../Redux/store";
import { signOut } from "../Redux/Salon/salonSlice";


const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1/salon`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = document.cookie
    .split(";")
    .find((row) => row.trim().startsWith("authToken"))
    ?.split("=")[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("401 detected, attempting to refresh token...");
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
          {},
          { withCredentials: true }
        );
        console.log("Token refreshed:", refreshResponse.data);
        return API(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        await API.post("/signout");
        store.dispatch(signOut());
        window.location.href = "/salon/login";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      alert("You have been blocked by the admin. Logging out");
      await API.post("/signout");
      store.dispatch(signOut());
      window.location.href = "/salon/login";
    }

    return Promise.reject(error);
  }
);

// Existing functions (unchanged)
export const signUpSalon = async (data: any) => {
  return await API.post("/register", data);
};
export const sentOtp = async (data: { email: string }) => {
  return await API.post("/otp", data);
};
export const verifyOtp = async (data: { email: string; otp: string }) => {
  return await API.put("/verify", data);
};
export const resentOtp = async (data: { email: string }) => {
  return await API.post("/resent-otp", data);
};
export const loginSalon = async (data: { email: string; password: string }) => {
  return await API.post("/login", data);
};
export const signOutSalon = async () => {
  return await API.post("/signout");
};
export const updateSalonProfile = async (data: ISalon) => {
  return await API.put("/profile", data);
};
export const uploadImage = async (data: FormData) => {
  return await API.post("/upload-image", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteImage = async (data: { salonId: string; imageId: string }) => {
  return await API.put("/delete-image", data);
};
export const getSalonData = async (data: { id: string }) => {
  return await API.get("/salon-service", {
    params: { id: data.id },
  });
};
export const getAllService = async () => {
  return await API.get("/service");
};
export const addService = async (data: {
  salonId: string;
  name: string;
  description: string;
  service: string;
  price: number;
}) => {
  return await API.put("/add-service", data);
};
export const updateService = async (data: {
  salonId: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
}) => {
  return await API.put("/edit-service", data);
};
export const addStylist = async (data: {
  salon: string;
  name: string;
  email: string;
  phone: string;
  workingHours: [
    { day: string; startTime: string; endTime: string; services: []; isAvailable: boolean }
  ];
}) => {
  return await API.post("/add-stylist", data);
};
export const getStylists = async (data: {
  id: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return await API.get("/stylist", {
    params: {
      id: data.id,
      page: data.page ?? 1,
      limit: data.limit ?? 10,
      search: data.search ?? "",
    },
  });
};
export const deleteStylist = async (id: string) => {
  return await API.delete(`/stylist/${id}`);
};
export const getStylistById = async (id: string) => {
  return await API.get(`/stylist/${id}`);
};
export const updateStylist = async (
  id: string,
  data: {
    name: string;
    email: string;
    phone: string;
    isAvailable: boolean;
    workingHours: { startTime: string; endTime: string }[];
  }
) => {
  return await API.put(`/stylist/edit/${id}`, data);
};
export const deleteService = async (data: { serviceId: string; salonId: string }) => {
  return await API.put("/delete-service", data);
};
export const cancelAppointment = async (appointmentId: string) => {
  return await API.put(`/appointments/${appointmentId}/cancel`);
};
export const completeAppointment = async (appointmentId: string) => {
  return await API.put(`/appointments/${appointmentId}/complete`);
};
export const getOffers = async (data: { id: string }) => {
  return await API.get("/offers", { params: { id: data.id } });
};
export const createOffer = async (data: {
  salonId: any;
  title: string;
  description: string;
  discount: number;
  serviceIds: string[];
  expiryDate: string;
}) => {
  return await API.post("/offers/create", data);
};
export const deactivateOffer = async (offerId: string) => {
  return await API.put(`/offers/${offerId}`, offerId);
};
export const deleteOffer = async (offerId: string) => {
  return await API.delete(`/offers/${offerId}/delete`);
};
export const getAppointments = async (
  page: number,
  limit: number,
  status?: string,
  search?: string
) => {
  const params: any = { page, limit };
  if (status && status !== "all") params.status = status;
  if (search) params.search = search;
  return await API.get("/appointments", { params });
};

// Chat-related functions
export const getChats = async () => {
  return await API.get("/chats");
};

export const getMessages = async (userId: string) => {
  return await API.get(`/messages/${userId}`);
};

export const deleteChat = async (userId: string) => {
  return await API.delete(`/chats/${userId}`);
};

export const markMessagesAsRead = async (userId: string) => {
  return await API.post(`/messages/${userId}/read`, {});
};

export const addReaction = async (messageId: string, emoji: string) => {
  return await API.post(`/messages/${messageId}/reaction`, { emoji });
};

export const getSalonDashboardData = async()=>{
  return await API.get('/dashboard')
}