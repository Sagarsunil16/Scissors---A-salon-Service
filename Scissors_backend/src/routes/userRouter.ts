import { Router } from 'express';
import UserController from '../controllers/UserController';
import auth from '../middleware/auth';
import SalonController from '../controllers/SalonController';
import BookingController from '../controllers/BookingController';
import { ROLES } from '../constants';
import AppointmentController from '../controllers/AppointmentController';
import ChatController from '../controllers/ChatController'
import MessageController from '../controllers/MessageController';
import upload from '../config/multer';
import ReviewController from '../controllers/ReviewController';

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
userRouter.get('/salons', auth([ROLES.USER]), SalonController.getAllSalons);
userRouter.post('/salons/nearby', auth([ROLES.USER]), SalonController.getNearbySalons);
userRouter.get('/salon-details', auth([ROLES.USER]), BookingController.getSalonDataWithSlots);
userRouter.get('/salons/:salonId/stylist', auth([ROLES.USER]), BookingController.getServiceStylist);
userRouter.get('/salons/:salonId/reviews', auth([ROLES.USER]), ReviewController.getSalonReviews);

userRouter.put('/profile', auth([ROLES.USER], true), UserController.updateUser);
userRouter.put('/change-password', auth([ROLES.USER], true), UserController.changePassword);
userRouter.post('/create-checkout-session', auth([ROLES.USER]), BookingController.createCheckoutSession);
userRouter.post('/webhook', BookingController.webHooks);
userRouter.get('/appointments', auth([ROLES.USER]), AppointmentController.getUserAppointments);
userRouter.put('/appointment/cancel/:id', auth([ROLES.USER]), AppointmentController.cancelAppointmentByUser);

// Chat-related routes
userRouter.get('/chats', auth([ROLES.USER]), ChatController.getUserChats);
userRouter.get('/messages/:salonId', auth([ROLES.USER]), MessageController.getMessages);
userRouter.post('/messages/upload', auth([ROLES.USER]), upload.single('file'), MessageController.uploadAttachment);

// Reviews
userRouter.post('/reviews', auth([ROLES.USER]), upload.single('file'), ReviewController.createReview);

export default userRouter;