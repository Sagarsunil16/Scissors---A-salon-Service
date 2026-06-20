"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const di_1 = require("../container/di");
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const category_dto_1 = require("../dto/category.dto");
const service_dto_1 = require("../dto/service.dto");
const adminRouter = (0, express_1.Router)();
// Public routes
adminRouter.post('/login', di_1.adminController.adminLogin.bind(di_1.adminController));
adminRouter.post('/signout', di_1.adminController.signOut.bind(di_1.adminController));
// Protected routes
adminRouter.put('/block-unblock', (0, auth_1.default)(['Admin']), di_1.adminController.blockUnblockUser.bind(di_1.adminController));
adminRouter.post('/delete-user', (0, auth_1.default)(['Admin']), di_1.adminController.deleteUser.bind(di_1.adminController));
adminRouter.get('/users', (0, auth_1.default)(['Admin']), di_1.adminController.getUsers.bind(di_1.adminController));
adminRouter.get('/salons', (0, auth_1.default)(['Admin']), di_1.adminController.getSalons.bind(di_1.adminController));
adminRouter.put('/salon/block-unblock', (0, auth_1.default)(['Admin']), di_1.adminController.blockAndUnblockSalon.bind(di_1.adminController));
adminRouter.put('/profile', (0, auth_1.default)(['Admin'], true), di_1.adminController.updateProfile.bind(di_1.adminController));
adminRouter.put('/change-password', (0, auth_1.default)(['Admin'], true), di_1.adminController.changePassword.bind(di_1.adminController));
adminRouter.post('/addCategory', (0, auth_1.default)(['Admin']), (0, validationMiddleware_1.default)(category_dto_1.CreateCategoryDto), di_1.categoryController.addNewCategory.bind(di_1.categoryController));
adminRouter.get('/categories', (0, auth_1.default)(['Admin']), di_1.categoryController.getFilteredCategory.bind(di_1.categoryController));
adminRouter.put('/edit-category', (0, auth_1.default)(['Admin']), (0, validationMiddleware_1.default)(category_dto_1.UpdateCategoryDto), di_1.categoryController.editCategory.bind(di_1.categoryController));
adminRouter.put('/delete-category', (0, auth_1.default)(['Admin']), di_1.categoryController.deleteCategory.bind(di_1.categoryController));
adminRouter.get('/service', (0, auth_1.default)(['Admin']), di_1.serviceController.getAllServices.bind(di_1.serviceController));
adminRouter.post('/add-service', (0, auth_1.default)(['Admin']), (0, validationMiddleware_1.default)(service_dto_1.CreateServiceDto), di_1.serviceController.createService.bind(di_1.serviceController));
adminRouter.delete('/delete-service', (0, auth_1.default)(['Admin']), di_1.serviceController.deleteService.bind(di_1.serviceController));
adminRouter.put('/edit-service', (0, auth_1.default)(['Admin']), (0, validationMiddleware_1.default)(service_dto_1.UpdateServiceDto), di_1.serviceController.updateService.bind(di_1.serviceController));
adminRouter.get('/dashboard', (0, auth_1.default)(["Admin"]), di_1.adminDashboardController.getDashboardData.bind(di_1.adminDashboardController));
exports.default = adminRouter;
