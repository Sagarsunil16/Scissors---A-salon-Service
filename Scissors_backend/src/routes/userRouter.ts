import { Router } from 'express';
import auth from '../middleware/auth';
import { ROLES } from '../constants';
import upload from '../config/multer';
import { appointmentController, bookingController, chatController, messageController, reviewController, salonController, userController, walletController } from '../container/di'
import express from 'express';
import BookingController from '../controllers/BookingController';
import WalletRepository from '../repositories/WalletRepository';

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
userRouter.get('/salons', auth([ROLES.USER]), salonController.getNearbySalons.bind(salonController));
// userRouter.get('/salons/nearby', auth([ROLES.USER]), salonController.getNearbySalons.bind(salonController));
userRouter.get('/salon-details', auth([ROLES.USER]), bookingController.getSalonDataWithSlots.bind(bookingController));
userRouter.get('/salons/:salonId/stylist', auth([ROLES.USER]), bookingController.getServiceStylists.bind(bookingController));
userRouter.post("/timeslots/available", bookingController.getAvailableSlots.bind(bookingController));
userRouter.get('/salons/:salonId/reviews', auth([ROLES.USER]), reviewController.getSalonReviews.bind(reviewController));
userRouter.post('/bookings',auth([ROLES.USER]),bookingController.createBooking.bind(bookingController))


userRouter.put('/profile', auth([ROLES.USER], true), userController.updateUser.bind(userController));
userRouter.put('/change-password', auth([ROLES.USER], true), userController.changePassword.bind(userController));
userRouter.post('/create-checkout-session', auth([ROLES.USER]), bookingController.createCheckoutSession.bind(bookingController));
userRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  bookingController.webHooks.bind(bookingController)
);
userRouter.get('/appointments', auth([ROLES.USER]), appointmentController.getUserAppointments.bind(appointmentController));
userRouter.put('/appointment/cancel/:id', auth([ROLES.USER]), appointmentController.cancelAppointmentByUser.bind(appointmentController));
userRouter.get('/wallet/balance',auth([ROLES.USER]),walletController.getBalance.bind(walletController))
userRouter.get('/wallet/transactions',auth([ROLES.USER]),walletController.getTransactionHistory.bind(walletController))

// Chat-related routes
userRouter.get('/chats', auth([ROLES.USER]), chatController.getUserChats.bind(chatController));
userRouter.get('/messages/:salonId', auth([ROLES.USER]), messageController.getMessages.bind(messageController));
userRouter.post('/messages/upload', auth([ROLES.USER]), upload.single('file'), messageController.uploadAttachment.bind(messageController));
userRouter.delete('/chats/:salonId', auth([ROLES.USER]), chatController.deleteChat.bind(chatController)); // New: Delete chat
userRouter.post('/messages/:salonId/read', auth([ROLES.USER]), messageController.markMessagesAsRead.bind(messageController)); // New: Mark messages as read
userRouter.post('/messages/:messageId/reaction', auth([ROLES.USER]), messageController.addReaction.bind(messageController)); // New: Add reaction to message

// Reviews
userRouter.post('/reviews', auth([ROLES.USER]), upload.single('file'), reviewController.createReview.bind(reviewController));



export default userRouter;


