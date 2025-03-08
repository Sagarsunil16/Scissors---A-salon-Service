import { Router } from "express";
import AdminController from "../controllers/AdminController";
import CategoryController from "../controllers/CategoryController";
import verifyToken from "../middleware/verifyToken";
import ServiceController from "../controllers/ServiceController";
import checkRole from "../middleware/checkRole";
const router = Router()

router.post('/login',AdminController.adminLogin)
router.post('/signout',AdminController.signOut)
router.put('/block-unblock',verifyToken,checkRole(["Admin"]),AdminController.blockUnblockUser)
router.post('/delete-user',verifyToken,checkRole(["Admin"]),AdminController.deleteUser)
router.post('/users',AdminController.getUsers)
router.post('/salons',AdminController.getSalons)
router.put('/salon/block-unblock',verifyToken,AdminController.blockAndUnblockSalon)
// router.post('/totalPages',AdminController.getTotalPages)
router.put('/profile',AdminController.updateProfile)
router.put('/change-password',verifyToken,checkRole(["Admin"]),AdminController.changePassword)
router.post('/addCategory',verifyToken,checkRole(["Admin"]),CategoryController.addNewCategory)
router.get('/category',CategoryController.getAllCategory)
router.put('/edit-category',verifyToken,checkRole(["Admin"]),CategoryController.editCategory)
router.put('/delete-category',verifyToken,checkRole(["Admin"]),CategoryController.deleteCategory)
router.get('/service',ServiceController.getAllServices)
router.post('/add-service',verifyToken,checkRole(["Admin"]),ServiceController.createService)
router.delete('/delete-service',verifyToken,checkRole(["Admin"]),ServiceController.deleteService)
router.put('/edit-service',verifyToken,checkRole(["Admin"]),ServiceController.updateService)
export default router