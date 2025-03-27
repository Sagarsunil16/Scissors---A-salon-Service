import { application, Router } from "express";
import UserController from "../controllers/UserController";
import verifyToken from "../middleware/verifyToken";
import authMiddleware from "../middleware/auth";
import checkRole from "../middleware/checkRole";
import SalonController from "../controllers/SalonController";
import BookingController from "../controllers/BookingController";
import { ROLES,API_ENDPOINTS } from "../constants";
import express from 'express'
const userRouter = Router();

// Public routes
userRouter.post('/signup', UserController.createUser);
userRouter.post('/login', UserController.userLogin);
userRouter.post('/signout', UserController.userSignOut);
userRouter.post('/forgot-password', UserController.sentOtp);
userRouter.post('/otp', UserController.sentOtp);
userRouter.put('/resend-otp', UserController.sentOtp);
userRouter.post('/verify-otp', UserController.verifyOtp);
userRouter.put('/reset-password', UserController.resetPassword);
userRouter.post('/auth/google', UserController.googleLogin);

// Protected routes
userRouter.get('/salons', verifyToken, authMiddleware, checkRole([ROLES.USER]), SalonController.getAllSalons);
userRouter.get('/salon-details', verifyToken, authMiddleware, checkRole([ROLES.USER]), BookingController.getSalonDataWithSlots);
userRouter.get('/salons/:salonId/stylist', BookingController.getServiceStylist);
// userRouter.get('/available-slots/:salonId/:serviceId', BookingController.getAvailableSlots);

userRouter.put('/profile', verifyToken, authMiddleware, checkRole([ROLES.USER]), UserController.updateUser);
userRouter.put('/change-password', verifyToken, authMiddleware, checkRole([ROLES.USER]), UserController.changePassword);
// userRouter.put('/booking',verifyToken,authMiddleware,checkRole([ROLES.USER]),BookingController.booking)
userRouter.post('/create-checkout-session',verifyToken,authMiddleware,checkRole([ROLES.USER]),BookingController.createCheckoutSession)
userRouter.post('/webhook',BookingController.webHooks)

export default userRouter;