"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = exports.PaymentStatus = exports.AppointmentStatus = void 0;
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["Pending"] = "pending";
    AppointmentStatus["Confirmed"] = "confirmed";
    AppointmentStatus["Completed"] = "completed";
    AppointmentStatus["Cancelled"] = "cancelled";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["Paid"] = "paid";
    PaymentStatus["Failed"] = "failed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["Cash"] = "cash";
    PaymentMethod["Online"] = "online";
    PaymentMethod["Wallet"] = "wallet";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
