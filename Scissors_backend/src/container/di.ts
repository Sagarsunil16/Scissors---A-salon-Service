import SalonRepository from "../repositories/SalonRepository";
import UserRepository from "../repositories/UserRepository";
import UserService from "../services/UserService";
import SalonService from "../services/SalonService";
import CategoryRepository from "../repositories/CategoryRepository";
import CategoryService from "../services/CategoryService";
import ServiceRepository from "../repositories/ServiceRepository";
import SalonMenuService from "../services/SalonMenuService";
import StylistRepositry from "../repositories/StylistRepository";
import StylistService from "../services/StylistService";
import SlotService from "../services/SlotService";
import TimeSlotRepository from "../repositories/TimeSlotRepository";
import AppointmentRepositry from "../repositories/AppointmentRepository";
import AppointmentService from "../services/AppointmentService";
import MessageRepository from "../repositories/MessageRepository";
import MessageService from "../services/MessageService";
import ReviewService from "../services/ReviewService";
import ReviewRepository from "../repositories/ReviewRepository";
import OfferRepository from "../repositories/OfferRepository";
import OfferService from "../services/OfferService";
import AdminController from "../controllers/AdminController";
import AppointmentController from "../controllers/AppointmentController";
import AuthController from "../controllers/AuthController";
import BookingController from "../controllers/BookingController";
import CategoryController from "../controllers/CategoryController";
import ChatController from "../controllers/ChatController";
import MessageController from "../controllers/MessageController";
import OfferController from "../controllers/OfferController";
import ReviewController from "../controllers/ReviewController";
import SalonController from "../controllers/SalonController";
import ServiceController from "../controllers/ServiceController";
import StylistController from "../controllers/StylistController";
import UserController from "../controllers/UserController";
import { IUserRepository } from "../Interfaces/User/IUserRepository";
import { ICategoryRepository } from "../Interfaces/Category/ICategoryRepository";
import { ISalonRepository } from "../Interfaces/Salon/ISalonRepository";
import { IServiceRepository } from "../Interfaces/Service/IServiceRepository";
import { IStylistRepository } from "../Interfaces/Stylist/IStylistRepository";
import { ITimeSlotRepository } from "../Interfaces/TimeSlot/ITimeSlotRepository";
import { IAppointmentRepository } from "../Interfaces/Appointment/IAppointmentRepository";
import { IMessageRepository } from "../Interfaces/Messages/IMessageRepository";
import { IReviewRepository } from "../Interfaces/Reviews/IReviewRepository";
import IOfferRepository from "../Interfaces/Offers/IOfferRepository";
import { IAppointmentService } from "../Interfaces/Appointment/IAppointmentService";
import { ICategoryService } from "../Interfaces/Category/ICategoryService";
import { IMessageService } from "../Interfaces/Messages/IMessageService";
import { IOfferService } from "../Interfaces/Offers/IOfferService";
import { IReviewService } from "../Interfaces/Reviews/IReviewService";
import { ISalonService } from "../Interfaces/Salon/ISalonService";
import { ISalonMenuService } from "../Interfaces/Service/ISerService";
import { ITimeSlotService } from "../Interfaces/TimeSlot/ITimeSlotService";
import { IStylistService } from "../Interfaces/Stylist/IStylistService";
import { IUserService } from "../Interfaces/User/IUserService";
import { IBookingService } from "../Interfaces/Booking/IBookingService";
import BookingService from "../services/BookingService";
import ChatRepository from "../repositories/ChatRepository";
import { ExpiredReservations } from "../cron/clearExpiredReservations";
import WalletRepository from "../repositories/WalletRepository";
import WalletTransactionRepository from "../repositories/WalletTransactionRepository";
import { IWalletService } from "../Interfaces/Wallet/IWalletService";
import WalletService from "../services/WalletService";
import WalletController from "../controllers/WalletController";
import { IAdminDashboardService } from "../Interfaces/AdminDashboard/IAdminDashboardService";
import AdminDashboardService from "../services/AdminDashboardService";
import AdminDashboardController from "../controllers/AdminDashboardController";
import SalonDashboardService from "../services/SalonDashboardService";
import SalonDashboardController from "../controllers/SalonDashboardController";
import { IAuthService } from "../Interfaces/Auth/IAuthService";
import AuthService from "../services/AuthService";




// Repositories
const userRepository:IUserRepository = new UserRepository();
const categoryRepository:ICategoryRepository = new CategoryRepository();
const salonRepository:ISalonRepository = new SalonRepository();
const serviceRepository:IServiceRepository = new ServiceRepository()
const stylistRepository:IStylistRepository = new StylistRepositry()
const timeSlotRepository:ITimeSlotRepository = new TimeSlotRepository()
const appointmentRepository:IAppointmentRepository =  new AppointmentRepositry()
const messageRepository:IMessageRepository =  new MessageRepository()
const reviewRepository:IReviewRepository = new ReviewRepository()
const offerRepository:IOfferRepository = new OfferRepository()
const chatRepository = new ChatRepository()
const walletRepository = new WalletRepository()
const walletTransactionRepository = new WalletTransactionRepository()
// Services
const userService:IUserService = new UserService(userRepository);
const categoryService:ICategoryService = new CategoryService(categoryRepository);
const salonService:ISalonService = new SalonService(salonRepository, categoryRepository);
const salonMenuService:ISalonMenuService = new SalonMenuService(serviceRepository)
const walletService:IWalletService = new WalletService(walletRepository,walletTransactionRepository)
const stylistService:IStylistService = new StylistService(stylistRepository,serviceRepository,salonRepository)
const timeSlotService:ITimeSlotService = new SlotService(salonRepository,timeSlotRepository,stylistRepository)
const appointmentService:IAppointmentService = new AppointmentService(appointmentRepository,timeSlotRepository,walletService)
const messageService:IMessageService = new MessageService(messageRepository,chatRepository)
const reviewService:IReviewService =  new ReviewService(reviewRepository)
const offerService:IOfferService = new OfferService(offerRepository)
const bookingService:IBookingService = new BookingService(timeSlotService,salonService,offerService,reviewService)
const adminDashboardService:IAdminDashboardService = new AdminDashboardService(userRepository,salonRepository,appointmentRepository)
const salonDashboardService = new SalonDashboardService(salonRepository,appointmentRepository)
const authService:IAuthService = new AuthService(salonService,userService)


//controllers
const adminController = new AdminController(userService,salonService)
const appointmentController = new AppointmentController(appointmentService)
const authController = new AuthController(authService)
const bookingController = new BookingController(offerService,reviewService,timeSlotService,salonService,bookingService,stylistService,appointmentService,walletService)
const categoryController = new CategoryController(categoryService)
const chatController = new ChatController(messageService,salonService)
const messageController = new MessageController(messageService)
const offerController = new OfferController(offerService)
const reviewController = new ReviewController(appointmentService,reviewService)
const salonController = new SalonController(salonService)
const serviceController = new ServiceController(salonMenuService)
const stylistController = new StylistController(stylistService)
const userController = new UserController(userService)
const expiredReservations = new ExpiredReservations(timeSlotRepository)
const walletController = new WalletController(walletService)
const adminDashboardController = new AdminDashboardController(adminDashboardService)
const salonDashboardController = new SalonDashboardController(salonDashboardService)


export {messageService,salonService,userService,appointmentController,adminController,authController,bookingController,categoryController,chatController,messageController,offerController,reviewController,salonController,serviceController,stylistController,userController,expiredReservations,walletController,adminDashboardController,salonDashboardController };
