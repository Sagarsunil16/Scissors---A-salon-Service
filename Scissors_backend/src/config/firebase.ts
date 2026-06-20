import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const defaultServiceAccountPath = path.resolve(
  process.cwd(),
  "secureDocs",
  "serviceAccount.json"
);

const parseServiceAccount = (value: string) => {
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
    const decoded = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      "base64"
    ).toString("utf8");
    return parseServiceAccount(decoded);
  }

  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || defaultServiceAccountPath;

  if (fs.existsSync(serviceAccountPath)) {
    return parseServiceAccount(fs.readFileSync(serviceAccountPath, "utf8"));
  }

  return null;
};

const serviceAccount = getServiceAccount();

export const isFirebaseConfigured = Boolean(serviceAccount);

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else if (!serviceAccount) {
  console.warn(
    `Firebase service account not found. Google login will be unavailable until FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_SERVICE_ACCOUNT, or ${defaultServiceAccountPath} is provided.`
  );
}

export default admin;
