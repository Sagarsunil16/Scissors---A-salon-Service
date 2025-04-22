import { Router } from "express";
import UserController from "../controllers/UserController";
import verifyToken from "../middleware/verifyToken";
import authMiddleware from "../middleware/auth";
import checkRole from "../middleware/checkRole";
import SalonController from "../controllers/SalonController";
import BookingController from "../controllers/BookingController";
import { ROLES, API_ENDPOINTS } from "../constants";
import AppointmentController from "../controllers/AppointmentController";
import ChatController from "../controllers/ChatController.ts";
import MessageController from "../controllers/MessageController";
import upload from "../config/multer";
const userRouter = Router();

// Public routes
userRouter.post("/signup", UserController.createUser);
userRouter.post("/login", UserController.userLogin);
userRouter.post("/signout", UserController.userSignOut);
userRouter.post("/forgot-password", UserController.sentOtp);
userRouter.post("/otp", UserController.sentOtp);
userRouter.put("/resend-otp", UserController.sentOtp);
userRouter.post("/verify-otp", UserController.verifyOtp);
userRouter.put("/reset-password", UserController.resetPassword);
userRouter.post("/auth/google", UserController.googleLogin);

// Protected routes
userRouter.get("/salons", verifyToken, authMiddleware, checkRole([ROLES.USER]), SalonController.getAllSalons);
userRouter.post('/salons/nearby',verifyToken,authMiddleware,checkRole([ROLES.USER]),SalonController.getNearbySalons)
userRouter.get("/salon-details", verifyToken, authMiddleware, checkRole([ROLES.USER]), BookingController.getSalonDataWithSlots);
userRouter.get("/salons/:salonId/stylist", verifyToken, authMiddleware, checkRole([ROLES.USER]), BookingController.getServiceStylist);

userRouter.put("/profile", verifyToken, authMiddleware, checkRole([ROLES.USER]), UserController.updateUser);
userRouter.put("/change-password", verifyToken, authMiddleware, checkRole([ROLES.USER]), UserController.changePassword);
userRouter.post("/create-checkout-session", verifyToken, authMiddleware, checkRole([ROLES.USER]), BookingController.createCheckoutSession);
userRouter.post("/webhook", BookingController.webHooks);
userRouter.get("/appointments", verifyToken, authMiddleware, checkRole([ROLES.USER]), AppointmentController.getUserAppointments);
// userRouter.get("/appointments/:id", verifyToken, authMiddleware, checkRole([ROLES.USER]), AppointmentController.getAppointmentDetails);
userRouter.put('/appointment/cancel/:id',verifyToken,authMiddleware,checkRole([ROLES.USER]),AppointmentController.cancelAppointmentByUser)

// Chat-related routes
userRouter.get("/chats", verifyToken, authMiddleware, checkRole([ROLES.USER]),ChatController.getUserChats);
userRouter.get("/messages/:salonId", verifyToken, authMiddleware, checkRole([ROLES.USER]),MessageController.getMessages);
userRouter.post("/messages/upload", verifyToken, authMiddleware, checkRole([ROLES.USER]), upload.single("file"), MessageController.uploadAttachment);

export default userRouter;