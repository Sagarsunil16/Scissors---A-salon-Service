import { Router } from 'express';
import SalonController from '../controllers/SalonController';
import auth from '../middleware/auth';
import upload from '../config/multer';
import ServiceController from '../controllers/ServiceController';
import StylistController from '../controllers/StylistController';
import MessageController from '../controllers/MessageController';
import AppointmentController from '../controllers/AppointmentController';
import { ROLES } from '../constants';
import ReviewController from '../controllers/ReviewController';
import OfferController from '../controllers/OfferController';
import ChatController from '../controllers/ChatController';

const salonRouter = Router();

// Public routes
salonRouter.post('/register', SalonController.createSalon);
salonRouter.post('/otp', SalonController.sentOtp);
salonRouter.put('/verify', SalonController.verifyOtAndUpdate);
salonRouter.post('/resend-otp', SalonController.sentOtp);
salonRouter.post('/login', SalonController.loginSalon);
salonRouter.post('/signout', SalonController.signOutSalon);

// Protected routes
salonRouter.post('/upload-image', auth([ROLES.SALON]), upload.single('image'), SalonController.uploadImage);
salonRouter.put('/delete-image', auth([ROLES.SALON]), SalonController.deleteImage);
salonRouter.get('/salon-service', auth([ROLES.SALON], true), SalonController.getSalonData);
salonRouter.get('/service', auth([ROLES.SALON]), ServiceController.getAllServices);
salonRouter.put('/add-service', auth([ROLES.SALON]), SalonController.addService);
salonRouter.put('/edit-service', auth([ROLES.SALON]), SalonController.updateService);
salonRouter.put('/delete-service', auth([ROLES.SALON]), SalonController.deleteService);
salonRouter.post('/add-stylist', auth([ROLES.SALON]), StylistController.createStylist);
salonRouter.get('/stylist', auth([ROLES.SALON]), StylistController.getStylistbySalonId);
salonRouter.get('/stylist/:id', auth([ROLES.SALON]), StylistController.getStylistById);
salonRouter.put('/stylist/edit/:id', auth([ROLES.SALON]), StylistController.updateStylist);
salonRouter.delete('/stylist/:id', auth([ROLES.SALON]), StylistController.deleteStylist);
salonRouter.put('/profile', auth([ROLES.SALON], true), SalonController.updateSalon);

// Chat-related routes
salonRouter.get('/chats', auth([ROLES.SALON]), ChatController.getSalonChats);
salonRouter.get('/messages/:userId', auth([ROLES.SALON]), MessageController.getMessages);
salonRouter.post('/messages/upload', auth([ROLES.SALON]), upload.single('file'), MessageController.uploadAttachment);

// Appointments
salonRouter.get('/appointments', auth([ROLES.SALON]), AppointmentController.getSalonAppointments);
salonRouter.put('/appointments/:id/cancel', auth([ROLES.SALON]), AppointmentController.cancelAppointment);
salonRouter.put('/appointments/:id/complete', auth([ROLES.SALON]), AppointmentController.completeAppointment);

// Offers
salonRouter.get('/offers', auth([ROLES.SALON]), OfferController.getSalonOffers);
salonRouter.post('/offers/create', auth([ROLES.SALON]), OfferController.createOffer);

export default salonRouter;