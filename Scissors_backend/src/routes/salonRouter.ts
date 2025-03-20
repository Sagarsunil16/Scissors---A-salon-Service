import { Router } from "express";
import SalonController from "../controllers/SalonController";
import verifyToken from "../middleware/verifyToken";
import upload from "../config/multer";
import ServiceController from "../controllers/ServiceController";
import StylistController from "../controllers/StylistController";

const salonRouter = Router();

// Public routes
salonRouter.post('/Register', SalonController.createSalon);
salonRouter.post('/otp', SalonController.sentOtp);
salonRouter.put('/verify', SalonController.verifyOtAndUpdate);
salonRouter.post('/resent-otp', SalonController.sentOtp);
salonRouter.post('/login', SalonController.loginSalon);
salonRouter.post('/signout', SalonController.signOutSalon);
salonRouter.post('/upload-image', upload.single("image"), SalonController.uploadImage);
salonRouter.put('/delete-image', SalonController.deleteImage);
salonRouter.get('/salon-service', SalonController.getSalonData);
salonRouter.get('/service', ServiceController.getAllServices);
salonRouter.put('/add-service', SalonController.addService);
salonRouter.put('/edit-service', SalonController.updateService);
salonRouter.post('/add-stylist', StylistController.createStylist);
salonRouter.get('/stylist', StylistController.getStylistbySalonId);
salonRouter.get('/stylist/:id', StylistController.getStylistById);
salonRouter.put('/stylist/edit/:id', StylistController.updateStylist);
salonRouter.delete('/stylist/:id', StylistController.deleteStylist);
salonRouter.put('/delete-service', SalonController.deleteService);

// Protected route
salonRouter.put("/profile", verifyToken, SalonController.updateSalon);

export default salonRouter;