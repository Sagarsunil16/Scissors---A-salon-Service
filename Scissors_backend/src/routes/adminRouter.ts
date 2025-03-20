import { Router } from "express";
import AdminController from "../controllers/AdminController";
import CategoryController from "../controllers/CategoryController";
import verifyToken from "../middleware/verifyToken";
import ServiceController from "../controllers/ServiceController";
import checkRole from "../middleware/checkRole";

const adminRouter = Router();

// Public routes
adminRouter.post('/login', AdminController.adminLogin);
adminRouter.post('/signout', AdminController.signOut);

// Protected routes
adminRouter.put('/block-unblock', verifyToken, checkRole(["Admin"]), AdminController.blockUnblockUser);
adminRouter.post('/delete-user', verifyToken, checkRole(["Admin"]), AdminController.deleteUser);
adminRouter.post('/users', AdminController.getUsers);
adminRouter.post('/salons', AdminController.getSalons);
adminRouter.put('/salon/block-unblock', verifyToken, checkRole(["Admin"]), AdminController.blockAndUnblockSalon);
// adminRouter.post('/totalPages', AdminController.getTotalPages);
adminRouter.put('/profile', verifyToken, checkRole(["Admin"]), AdminController.updateProfile);
adminRouter.put('/change-password', verifyToken, checkRole(["Admin"]), AdminController.changePassword);
adminRouter.post('/addCategory', verifyToken, checkRole(["Admin"]), CategoryController.addNewCategory);
adminRouter.get('/category', CategoryController.getAllCategory);
adminRouter.put('/edit-category', verifyToken, checkRole(["Admin"]), CategoryController.editCategory);
adminRouter.put('/delete-category', verifyToken, checkRole(["Admin"]), CategoryController.deleteCategory);
adminRouter.get('/service', ServiceController.getAllServices);
adminRouter.post('/add-service', verifyToken, checkRole(["Admin"]), ServiceController.createService);
adminRouter.delete('/delete-service', verifyToken, checkRole(["Admin"]), ServiceController.deleteService);
adminRouter.put('/edit-service', verifyToken, checkRole(["Admin"]), ServiceController.updateService);

export default adminRouter;