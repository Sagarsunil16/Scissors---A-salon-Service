"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const multer_1 = __importDefault(require("../config/multer"));
const constants_1 = require("../constants");
const di_1 = require("../container/di");
const salon_dto_1 = require("../dto/salon.dto");
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const salonRouter = (0, express_1.Router)();
// Public routes
salonRouter.post('/register', (0, validationMiddleware_1.default)(salon_dto_1.CreateSalonDto), di_1.salonController.createSalon.bind(di_1.salonController));
salonRouter.post('/otp', di_1.salonController.sendOtp.bind(di_1.salonController));
salonRouter.put('/verify', di_1.salonController.verifyOtpAndUpdate.bind(di_1.salonController));
salonRouter.post('/resend-otp', di_1.salonController.sendOtp.bind(di_1.salonController));
salonRouter.post('/login', (0, validationMiddleware_1.default)(salon_dto_1.LoginSalonDto), di_1.salonController.loginSalon.bind(di_1.salonController));
salonRouter.post('/signout', di_1.salonController.signOutSalon.bind(di_1.salonController));
// Protected routes
salonRouter.get('/dashboard', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.salonDashboardController.getDashboardData.bind(di_1.salonDashboardController));
salonRouter.post('/upload-image', (0, auth_1.default)([constants_1.ROLES.SALON]), multer_1.default.single('image'), di_1.salonController.uploadImage.bind(di_1.salonController));
salonRouter.put('/delete-image', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.salonController.deleteImage.bind(di_1.salonController));
salonRouter.get('/salon-service', (0, auth_1.default)([constants_1.ROLES.SALON], true), di_1.salonController.getSalonData.bind(di_1.salonController));
salonRouter.get('/service', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.serviceController.getAllServices.bind(di_1.serviceController));
salonRouter.put('/add-service', (0, auth_1.default)([constants_1.ROLES.SALON]), (0, validationMiddleware_1.default)(salon_dto_1.AddServiceDto), di_1.salonController.addService.bind(di_1.salonController));
salonRouter.put('/edit-service', (0, auth_1.default)([constants_1.ROLES.SALON]), (0, validationMiddleware_1.default)(salon_dto_1.UpdateServiceDto), di_1.salonController.updateService.bind(di_1.salonController));
salonRouter.put('/delete-service', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.salonController.deleteService.bind(di_1.salonController));
salonRouter.post('/add-stylist', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.stylistController.createStylist.bind(di_1.stylistController));
salonRouter.get('/stylist', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.stylistController.getStylistbySalonId.bind(di_1.stylistController));
salonRouter.get('/stylist/:id', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.stylistController.getStylistById.bind(di_1.stylistController));
salonRouter.put('/stylist/edit/:id', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.stylistController.updateStylist.bind(di_1.stylistController));
salonRouter.delete('/stylist/:id', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.stylistController.deleteStylist.bind(di_1.stylistController));
salonRouter.put('/profile', (0, auth_1.default)([constants_1.ROLES.SALON], true), (0, validationMiddleware_1.default)(salon_dto_1.UpdateSalonDto), di_1.salonController.updateSalon.bind(di_1.salonController));
// Chat-related routes
salonRouter.get('/chats', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.chatController.getSalonChats.bind(di_1.chatController));
salonRouter.get('/messages/:userId', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.messageController.getSalonMessages.bind(di_1.messageController));
salonRouter.post('/messages/upload', (0, auth_1.default)([constants_1.ROLES.SALON]), multer_1.default.single('file'), di_1.messageController.uploadAttachment.bind(di_1.messageController));
salonRouter.delete('/chats/:userId', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.chatController.deleteSalonChat.bind(di_1.chatController)); // New: Delete chat
salonRouter.post('/messages/:userId/read', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.messageController.markMessagesAsRead.bind(di_1.messageController)); // New: Mark messages as read
salonRouter.post('/messages/:messageId/reaction', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.messageController.addReaction.bind(di_1.messageController)); // New: Add reaction to message
// Appointments
salonRouter.get('/appointments', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.appointmentController.getSalonAppointments.bind(di_1.appointmentController));
salonRouter.put('/appointments/:id/cancel', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.appointmentController.cancelAppointment.bind(di_1.appointmentController));
salonRouter.put('/appointments/:id/complete', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.appointmentController.completeAppointment.bind(di_1.appointmentController));
// Offers
salonRouter.get('/offers', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.offerController.getSalonOffers.bind(di_1.offerController));
salonRouter.post('/offers/create', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.offerController.createOffer.bind(di_1.offerController));
salonRouter.put('/offers/:id', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.offerController.updateOfferStatus.bind(di_1.offerController));
salonRouter.delete('/offers/:id/delete', (0, auth_1.default)([constants_1.ROLES.SALON]), di_1.offerController.deleteOffer.bind(di_1.offerController));
exports.default = salonRouter;
