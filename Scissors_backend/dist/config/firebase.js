"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseConfigured = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
dotenv_1.default.config();
const defaultServiceAccountPath = path_1.default.resolve(process.cwd(), "secureDocs", "serviceAccount.json");
const parseServiceAccount = (value) => {
    const serviceAccount = JSON.parse(value);
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    return serviceAccount;
};
const getServiceAccount = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        return parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
        return parseServiceAccount(decoded);
    }
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || defaultServiceAccountPath;
    if (fs_1.default.existsSync(serviceAccountPath)) {
        return parseServiceAccount(fs_1.default.readFileSync(serviceAccountPath, "utf8"));
    }
    return null;
};
const serviceAccount = getServiceAccount();
exports.isFirebaseConfigured = Boolean(serviceAccount);
if (!firebase_admin_1.default.apps.length && serviceAccount) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
else if (!serviceAccount) {
    console.warn(`Firebase service account not found. Google login will be unavailable until FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_SERVICE_ACCOUNT, or ${defaultServiceAccountPath} is provided.`);
}
exports.default = firebase_admin_1.default;
