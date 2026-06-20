import dotenv from "dotenv";
import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const defaultServiceAccountPath = path.resolve(
  process.cwd(),
  "secureDocs/serviceAccount.json"
);

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || defaultServiceAccountPath;

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccountJson = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      "base64"
    ).toString("utf8");

    return JSON.parse(serviceAccountJson);
  }

  if (fs.existsSync(serviceAccountPath)) {
    return require(serviceAccountPath);
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
    `Firebase service account not found. Google login will be unavailable until FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_BASE64, or ${defaultServiceAccountPath} is provided.`
  );
}

export default admin;
