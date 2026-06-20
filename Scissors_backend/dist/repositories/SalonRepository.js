"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Salon_1 = __importDefault(require("../models/Salon"));
const MasterService_1 = __importDefault(require("../models/MasterService"));
const BaseRepository_1 = require("./BaseRepository");
class SalonRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Salon_1.default);
    }
    // Only include if ISalonRepository requires it
    createSalon(salonData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(salonData);
        });
    }
    findSalonRaw(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findById(id).lean();
        });
    }
    getSalonByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ email }).populate("services.service").lean().exec();
        });
    }
    updateSalon(id_1, update_1) {
        return __awaiter(this, arguments, void 0, function* (id, update, options = { new: true }) {
            return yield this.model.findByIdAndUpdate(id, update, options).lean().exec();
        });
    }
    // Only include if ISalonRepository requires it
    getSalonById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id).populate("services.service").populate("services.stylists").lean().exec();
        });
    }
    getNearbySalons(longitude, latitude, radius, query, skip, limit, sortOption) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .find(Object.assign(Object.assign({}, query), { "address.location": {
                    $geoWithin: {
                        $centerSphere: [[longitude, latitude], radius / 6378100], // Radius in radians (Earth radius ~6378.1 km)
                    },
                } }))
                .select("salonName address services rating images category")
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();
        });
    }
    getAllSalons(query, skip, limit, sortOption) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(query);
            return this.model.find(query).select('salonName address services rating images category')
                .sort(sortOption).skip(skip).limit(limit).lean().exec();
        });
    }
    countNearbySalons(longitude, latitude, radius, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .countDocuments(Object.assign(Object.assign({}, query), { "address.location": {
                    $geoWithin: {
                        $centerSphere: [[longitude, latitude], radius / 6378100],
                    },
                } })).exec();
        });
    }
    countAllSalons(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments(query).exec();
        });
    }
    getAllSalon(page_1) {
        return __awaiter(this, arguments, void 0, function* (page, query = {}, limit = 10) {
            try {
                const salons = yield this.model.find(query)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('services.service');
                const totalCount = yield this.model.countDocuments(query);
                return { data: salons, totalCount };
            }
            catch (error) {
                console.log("Error fetching salon data", error);
                throw new Error("Could not fetch salons");
            }
        });
    }
    getSalonService(salonId, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this.model.findById(salonId).lean().exec();
            return (salon === null || salon === void 0 ? void 0 : salon.services.find((s) => s._id.toString() === serviceId)) || null;
        });
    }
    updateSalonOtp(email, otp, otpExpiry) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOneAndUpdate({ email }, { otp, otpExpiry }, { new: true }).lean().exec();
        });
    }
    verifyOtpAndUpdate(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOneAndUpdate({ email }, { otp: null, otpExpiry: null, verified: true }, { new: true }).lean().exec();
        });
    }
    updateSalonProfile(updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOneAndUpdate({ email: updatedData.email }, Object.assign({}, updatedData), { new: true }).lean().exec();
        });
    }
    updateSalonStatus(id, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, { is_Active: isActive }, { new: true }).lean().exec();
        });
    }
    addImagesToSalon(salonId, imageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this.findById(salonId);
            if (!salon) {
                throw new Error("Salon not found");
            }
            salon.images.push(imageData);
            yield salon.save();
            return salon;
        });
    }
    deleteSalonImage(salonId, imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this.findById(salonId);
            if (!salon) {
                return null;
            }
            salon.images = salon.images.filter((img) => img._id.toString() !== imageId);
            yield salon.save();
            return salon;
        });
    }
    addService(salonId, serviceData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(salonId, { $push: { services: serviceData } }, { new: true }).lean().exec();
        });
    }
    updateService(salonId, serviceId, serviceData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findOneAndUpdate({
                _id: new mongoose_1.default.Types.ObjectId(salonId),
                "services._id": new mongoose_1.default.Types.ObjectId(serviceId),
            }, {
                $set: {
                    "services.$.name": serviceData.name,
                    "services.$.description": serviceData.description,
                    "services.$.service": serviceData.service,
                    "services.$.price": serviceData.price,
                    "services.$.duration": serviceData.duration,
                    "services.$.stylists": serviceData.stylists,
                },
            }, { new: true })
                .populate("services.service services.stylists")
                .lean()
                .exec();
        });
    }
    findOrCreateService(serviceData) {
        return __awaiter(this, void 0, void 0, function* () {
            let service = yield MasterService_1.default.findOne({
                serviceName: serviceData.serviceName,
                category: serviceData.category,
            });
            if (!service) {
                service = yield MasterService_1.default.create(serviceData);
            }
            return service._id;
        });
    }
    linkServiceToSalon(salonId, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findByIdAndUpdate(salonId, { $addToSet: { serviceIds: serviceId } }, { new: true })
                .populate("serviceIds")
                .exec();
        });
    }
    totalPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield this.countDocuments({});
            return Math.ceil(total / 10);
        });
    }
    findAllSalons(filters, page, itemsPerPage) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {};
            if (filters.search) {
                query.$or = [
                    { salonName: { $regex: filters.search, $options: "i" } },
                    { "services.name": { $regex: filters.search, $options: "i" } },
                ];
            }
            if (filters.location) {
                query.$or = [
                    { "address.city": { $regex: filters.location, $options: "i" } },
                    { "address.areaStreet": { $regex: filters.location, $options: "i" } },
                ];
            }
            if (filters.maxPrice) {
                query["services.price"] = { $lte: filters.maxPrice };
            }
            if (filters.rating && filters.rating.length > 0) {
                query.averageRating = { $in: filters.rating };
            }
            const result = yield this.findAll(query, page, itemsPerPage);
            yield this.model.populate(result.data, { path: "services.service" });
            return { salons: result.data, total: result.totalCount };
        });
    }
    removeService(salonId, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findByIdAndUpdate(salonId, { $pull: { services: { _id: serviceId } } }, { new: true })
                .lean()
                .exec();
        });
    }
    allSalonListForChat() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find({}, "_id salonName email images").lean().exec();
        });
    }
    countActiveSalons() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments({ is_Active: true }).exec();
        });
    }
    countUniqueServices() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this.model.aggregate([
                { $unwind: "$services" },
                { $group: { _id: "$services" } },
                { $count: "total" }
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        });
    }
    countServicesBySalon(salonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const salon = yield this.model.findById(salonId).select('services');
            return (salon === null || salon === void 0 ? void 0 : salon.services.length) || 0;
        });
    }
}
exports.default = SalonRepository;
