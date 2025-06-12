import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'secureDocs/serviceAccount.json');

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Firebase service account key not found at path: ${serviceAccountPath}`);
  }

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
