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

// Repositories
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const salonRepository = new SalonRepository();
const serviceRepository = new ServiceRepository()
const stylistRepository = new StylistRepositry()

// Services
const userService = new UserService(userRepository);
const categoryService = new CategoryService(categoryRepository);
const salonService = new SalonService(salonRepository, categoryRepository);
const serService = new SerService(serviceRepository)
const stylistService = new StylistService(stylistRepository,serviceRepository,salonRepository)

export { userService, salonService, categoryService,serService,stylistService };
