import SalonRepository from "../repositories/SalonRepository";
import UserRepository from "../repositories/UserRepository";
import UserService from "../services/UserService";
import SalonService from "../services/SalonService";

const userRepository = new UserRepository();
const userService = new UserService(userRepository)

const salonRepository =  new SalonRepository()
const salonService = new SalonService(salonRepository)

export { userService, salonService };