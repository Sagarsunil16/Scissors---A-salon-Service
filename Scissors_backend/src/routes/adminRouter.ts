import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import CategoryController from '../controllers/CategoryController';
import auth from '../middleware/auth';
import ServiceController from '../controllers/ServiceController';

const adminRouter = Router();

// Public routes
adminRouter.post('/login', AdminController.adminLogin);
adminRouter.post('/signout', AdminController.signOut);

// Protected routes
adminRouter.put('/block-unblock', auth(['Admin']), AdminController.blockUnblockUser);
adminRouter.post('/delete-user', auth(['Admin']), AdminController.deleteUser);
adminRouter.get('/users', auth(['Admin']), AdminController.getUsers);
adminRouter.get('/salons', auth(['Admin']), AdminController.getSalons);
adminRouter.put('/salon/block-unblock', auth(['Admin']), AdminController.blockAndUnblockSalon);
adminRouter.put('/profile', auth(['Admin'], true), AdminController.updateProfile);
adminRouter.put('/change-password', auth(['Admin'], true), AdminController.changePassword);
adminRouter.post('/addCategory', auth(['Admin']), CategoryController.addNewCategory);
adminRouter.get('/categories', auth(['Admin']), CategoryController.getFilteredCategory);
adminRouter.put('/edit-category', auth(['Admin']), CategoryController.editCategory);
adminRouter.put('/delete-category', auth(['Admin']), CategoryController.deleteCategory);
adminRouter.get('/service', auth(['Admin']), ServiceController.getAllServices);
adminRouter.post('/add-service', auth(['Admin']), ServiceController.createService);
adminRouter.delete('/delete-service', auth(['Admin']), ServiceController.deleteService);
adminRouter.put('/edit-service', auth(['Admin']), ServiceController.updateService);

export default adminRouter;