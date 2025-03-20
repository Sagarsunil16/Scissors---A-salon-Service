import SalonRepository from "../repositories/SalonRepository";
import UserRepository from "../repositories/UserRepository";
import UserService from "../services/UserService";
import SalonService from "../services/SalonService";
import CategoryRepository from "../repositories/CategoryRepository";
import CategoryService from "../services/CategoryService";
import ServiceRepository from "../repositories/ServiceRepository";
import SerService from "../services/serService";
import StylistRepositry from "../repositories/StylistRepository";
import StylistService from "../services/StylistService";
import SlotService from "../services/SlotService";
import TimeSlotRepository from "../repositories/TimeSlotRepository";

// Repositories
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const salonRepository = new SalonRepository();
const serviceRepository = new ServiceRepository()
const stylistRepository = new StylistRepositry()
const timeSlotRepository = new TimeSlotRepository()

// Services
const userService = new UserService(userRepository);
const categoryService = new CategoryService(categoryRepository);
const salonService = new SalonService(salonRepository, categoryRepository);
const serService = new SerService(serviceRepository)
const stylistService = new StylistService(stylistRepository,serviceRepository,salonRepository)
const timeSlotService = new SlotService(salonRepository,timeSlotRepository)

export { userService, salonService, categoryService,serService,stylistService,timeSlotService };
