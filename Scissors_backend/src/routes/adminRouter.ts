import { Router } from 'express';
import auth from '../middleware/auth';
import { adminController, adminDashboardController, categoryController, serviceController } from '../container/di';

const adminRouter = Router();

// Public routes
adminRouter.post('/login', adminController.adminLogin.bind(adminController));
adminRouter.post('/signout', adminController.signOut.bind(adminController));

// Protected routes
adminRouter.put('/block-unblock', auth(['Admin']), adminController.blockUnblockUser.bind(adminController));
adminRouter.post('/delete-user', auth(['Admin']), adminController.deleteUser.bind(adminController));
adminRouter.get('/users', auth(['Admin']), adminController.getUsers.bind(adminController));
adminRouter.get('/salons', auth(['Admin']), adminController.getSalons.bind(adminController));
adminRouter.put('/salon/block-unblock', auth(['Admin']), adminController.blockAndUnblockSalon.bind(adminController));
adminRouter.put('/profile', auth(['Admin'], true), adminController.updateProfile.bind(adminController));
adminRouter.put('/change-password', auth(['Admin'], true), adminController.changePassword.bind(adminController));
adminRouter.post('/addCategory', auth(['Admin']), categoryController.addNewCategory.bind(categoryController));
adminRouter.get('/categories', auth(['Admin']), categoryController.getFilteredCategory.bind(categoryController));
adminRouter.put('/edit-category', auth(['Admin']), categoryController.editCategory.bind(categoryController));
adminRouter.put('/delete-category', auth(['Admin']), categoryController.deleteCategory.bind(categoryController));
adminRouter.get('/service', auth(['Admin']), serviceController.getAllServices.bind(serviceController));
adminRouter.post('/add-service', auth(['Admin']), serviceController.createService.bind(serviceController));
adminRouter.delete('/delete-service', auth(['Admin']), serviceController.deleteService.bind(serviceController));
adminRouter.put('/edit-service', auth(['Admin']), serviceController.updateService.bind(serviceController));
adminRouter.get('/dashboard',auth(["Admin"]),adminDashboardController.getDashboardData.bind(adminDashboardController))

export default adminRouter;