import { Router } from 'express';
import auth from '../middleware/auth';
import { ROLES } from '../constants';
import upload from '../config/multer';
import { appointmentController, bookingController, chatController, messageController, reviewController, salonController, userController } from '../container/di';

const userRouter = Router();

// Public routes
userRouter.post('/signup', userController.createUser.bind(userController));
userRouter.post('/login', userController.userLogin.bind(userController));
userRouter.post('/signout', userController.userSignOut.bind(userController));
userRouter.post('/forgot-password', userController.sentOtp.bind(userController));
userRouter.post('/otp', userController.sentOtp.bind(userController));
userRouter.put('/resend-otp', userController.sentOtp.bind(userController));
userRouter.post('/verify-otp', userController.verifyOtp.bind(userController));
userRouter.put('/reset-password', userController.resetPassword.bind(userController));
userRouter.post('/auth/google', userController.googleLogin.bind(userController));

// Protected routes
userRouter.get('/salons', auth([ROLES.USER]), salonController.getAllSalons.bind(salonController));
userRouter.post('/salons/nearby', auth([ROLES.USER]), salonController.getNearbySalons.bind(salonController));
userRouter.get('/salon-details', auth([ROLES.USER]), bookingController.getSalonDataWithSlots.bind(bookingController));
userRouter.get('/salons/:salonId/stylist', auth([ROLES.USER]), bookingController.getServiceStylist.bind(bookingController));
userRouter.get('/salons/:salonId/reviews', auth([ROLES.USER]), reviewController.getSalonReviews.bind(reviewController));

userRouter.put('/profile', auth([ROLES.USER], true), userController.updateUser.bind(userController));
userRouter.put('/change-password', auth([ROLES.USER], true), userController.changePassword.bind(userController));
userRouter.post('/create-checkout-session', auth([ROLES.USER]), bookingController.createCheckoutSession.bind(bookingController));
userRouter.post('/webhook', bookingController.webHooks.bind(bookingController));
userRouter.get('/appointments', auth([ROLES.USER]), appointmentController.getUserAppointments.bind(appointmentController));
userRouter.put('/appointment/cancel/:id', auth([ROLES.USER]), appointmentController.cancelAppointmentByUser.bind(appointmentController));

// Chat-related routes
userRouter.get('/chats', auth([ROLES.USER]), chatController.getUserChats.bind(chatController));
userRouter.get('/messages/:salonId', auth([ROLES.USER]), messageController.getMessages.bind(messageController));
userRouter.post('/messages/upload', auth([ROLES.USER]), upload.single('file'), messageController.uploadAttachment.bind(messageController));

// Reviews
userRouter.post('/reviews', auth([ROLES.USER]), upload.single('file'), reviewController.createReview.bind(reviewController));

export default userRouter;