"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const IAppointment_1 = require("../Interfaces/Appointment/IAppointment");
const appointmentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    salon: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Salon",
        required: true,
    },
    stylist: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Stylist",
        required: true,
    },
    services: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
    ],
    slots: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "TimeSlot",
            required: true,
        },
    ],
    status: {
        type: String,
        enum: Object.values(IAppointment_1.AppointmentStatus),
        default: IAppointment_1.AppointmentStatus.Pending
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(IAppointment_1.PaymentStatus),
        default: IAppointment_1.PaymentStatus.Pending,
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "online", "wallet"],
        required: true,
    },
    stripeSessionId: {
        type: String,
        default: null
    },
    serviceOption: {
        type: String,
        enum: ["home", "store"],
        required: true,
    },
    isReviewed: {
        type: Boolean,
        default: false
    },
    address: {
        type: {
            areaStreet: String,
            city: String,
            state: String,
            pincode: String
        },
        required: function () {
            return this.serviceOption === "home";
        },
    },
    refundToWallet: {
        type: Boolean,
        default: false
    },
    walletTransaction: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'WalletTransaction',
        default: null
    },
    bookingId: {
        type: String,
        default: null
    }
}, { timestamps: true });
appointmentSchema.index({ user: 1, salon: 1, status: 1 });
exports.default = mongoose_1.default.model("Appointment", appointmentSchema);
