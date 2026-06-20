"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const constants_1 = require("../constants");
const multer_1 = __importDefault(require("../config/multer"));
const di_1 = require("../container/di");
const userRouter = (0, express_1.Router)();
// Public routes
userRouter.post('/signup', di_1.userController.createUser.bind(di_1.userController));
userRouter.post('/login', di_1.userController.userLogin.bind(di_1.userController));
userRouter.post('/signout', di_1.userController.userSignOut.bind(di_1.userController));
userRouter.post('/forgot-password', di_1.userController.sentOtp.bind(di_1.userController));
userRouter.post('/otp', di_1.userController.sentOtp.bind(di_1.userController));
userRouter.put('/resend-otp', di_1.userController.sentOtp.bind(di_1.userController));
userRouter.post('/verify-otp', di_1.userController.verifyOtp.bind(di_1.userController));
userRouter.put('/reset-password', di_1.userController.resetPassword.bind(di_1.userController));
userRouter.post('/auth/google', di_1.userController.googleLogin.bind(di_1.userController));
// Public salon discovery routes
userRouter.get('/salons', di_1.salonController.getNearbySalons.bind(di_1.salonController));
// userRouter.get('/salons/nearby', salonController.getNearbySalons.bind(salonController));
userRouter.get('/salon-details', di_1.bookingController.getSalonDataWithSlots.bind(di_1.bookingController));
userRouter.get('/salons/:salonId/stylist', di_1.bookingController.getServiceStylists.bind(di_1.bookingController));
userRouter.post("/timeslots/available", di_1.bookingController.getAvailableSlots.bind(di_1.bookingController));
userRouter.get('/salons/:salonId/reviews', di_1.reviewController.getSalonReviews.bind(di_1.reviewController));
// Protected routes
userRouter.post('/bookings', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.bookingController.createBooking.bind(di_1.bookingController));
userRouter.put('/profile', (0, auth_1.default)([constants_1.ROLES.USER], true), di_1.userController.updateUser.bind(di_1.userController));
userRouter.put('/change-password', (0, auth_1.default)([constants_1.ROLES.USER], true), di_1.userController.changePassword.bind(di_1.userController));
userRouter.post('/create-checkout-session', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.bookingController.createCheckoutSession.bind(di_1.bookingController));
userRouter.get('/checkout-session/:sessionId/status', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.bookingController.getCheckoutSessionStatus.bind(di_1.bookingController));
// userRouter.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   bookingController.webHooks.bind(bookingController)
// );
userRouter.get('/appointments', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.appointmentController.getUserAppointments.bind(di_1.appointmentController));
userRouter.put('/appointment/cancel/:id', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.appointmentController.cancelAppointmentByUser.bind(di_1.appointmentController));
userRouter.get('/wallet/balance', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.walletController.getBalance.bind(di_1.walletController));
userRouter.get('/wallet/transactions', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.walletController.getTransactionHistory.bind(di_1.walletController));
// Chat-related routes
userRouter.get('/chats', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.chatController.getUserChats.bind(di_1.chatController));
userRouter.get('/messages/:salonId', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.messageController.getMessages.bind(di_1.messageController));
userRouter.post('/messages/upload', (0, auth_1.default)([constants_1.ROLES.USER]), multer_1.default.single('file'), di_1.messageController.uploadAttachment.bind(di_1.messageController));
userRouter.delete('/chats/:salonId', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.chatController.deleteChat.bind(di_1.chatController)); // New: Delete chat
userRouter.post('/messages/:salonId/read', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.messageController.markMessagesAsRead.bind(di_1.messageController)); // New: Mark messages as read
userRouter.post('/messages/:messageId/reaction', (0, auth_1.default)([constants_1.ROLES.USER]), di_1.messageController.addReaction.bind(di_1.messageController)); // New: Add reaction to message
// Reviews
userRouter.post('/reviews', (0, auth_1.default)([constants_1.ROLES.USER]), multer_1.default.single('file'), di_1.reviewController.createReview.bind(di_1.reviewController));
exports.default = userRouter;
