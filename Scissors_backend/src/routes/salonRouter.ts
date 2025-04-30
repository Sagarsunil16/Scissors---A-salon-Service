import { Router } from 'express';
import auth from '../middleware/auth';
import upload from '../config/multer';
import { ROLES } from '../constants';
import { appointmentController, chatController, messageController, offerController, salonController, serviceController, stylistController } from '../container/di';

const salonRouter = Router();

// Public routes
salonRouter.post('/register', salonController.createSalon.bind(salonController));
salonRouter.post('/otp', salonController.sentOtp.bind(salonController));
salonRouter.put('/verify', salonController.verifyOtAndUpdate.bind(salonController));
salonRouter.post('/resend-otp', salonController.sentOtp.bind(salonController));
salonRouter.post('/login', salonController.loginSalon.bind(salonController));
salonRouter.post('/signout', salonController.signOutSalon.bind(salonController));

// Protected routes
salonRouter.post('/upload-image', auth([ROLES.SALON]), upload.single('image'), salonController.uploadImage.bind(salonController));
salonRouter.put('/delete-image', auth([ROLES.SALON]), salonController.deleteImage.bind(salonController));
salonRouter.get('/salon-service', auth([ROLES.SALON], true), salonController.getSalonData.bind(salonController));
salonRouter.get('/service', auth([ROLES.SALON]), serviceController.getAllServices.bind(serviceController));
salonRouter.put('/add-service', auth([ROLES.SALON]), salonController.addService.bind(salonController));
salonRouter.put('/edit-service', auth([ROLES.SALON]), salonController.updateService.bind(salonController));
salonRouter.put('/delete-service', auth([ROLES.SALON]), salonController.deleteService.bind(salonController));
salonRouter.post('/add-stylist', auth([ROLES.SALON]), stylistController.createStylist.bind(stylistController));
salonRouter.get('/stylist', auth([ROLES.SALON]), stylistController.getStylistbySalonId.bind(stylistController));
salonRouter.get('/stylist/:id', auth([ROLES.SALON]), stylistController.getStylistById.bind(stylistController));
salonRouter.put('/stylist/edit/:id', auth([ROLES.SALON]), stylistController.updateStylist.bind(stylistController));
salonRouter.delete('/stylist/:id', auth([ROLES.SALON]), stylistController.deleteStylist.bind(stylistController));
salonRouter.put('/profile', auth([ROLES.SALON], true), salonController.updateSalon.bind(salonController));

// Chat-related routes
salonRouter.get('/chats', auth([ROLES.SALON]), chatController.getSalonChats.bind(chatController));
salonRouter.get('/messages/:userId', auth([ROLES.SALON]), messageController.getMessages.bind(messageController));
salonRouter.post('/messages/upload', auth([ROLES.SALON]), upload.single('file'), messageController.uploadAttachment.bind(messageController));

// Appointments
salonRouter.get('/appointments', auth([ROLES.SALON]), appointmentController.getSalonAppointments.bind(appointmentController));
salonRouter.put('/appointments/:id/cancel', auth([ROLES.SALON]), appointmentController.cancelAppointment.bind(appointmentController));
salonRouter.put('/appointments/:id/complete', auth([ROLES.SALON]), appointmentController.completeAppointment.bind(appointmentController));

// Offers
salonRouter.get('/offers', auth([ROLES.SALON]), offerController.getSalonOffers.bind(offerController));
salonRouter.post('/offers/create', auth([ROLES.SALON]), offerController.createOffer.bind(offerController));

export default salonRouter;