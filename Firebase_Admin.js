// firebaseAdmin.js
import admin from 'firebase-admin';
import { createRequire } from 'module'; // Needed to import JSON in ES modules

const require = createRequire(import.meta.url);
const serviceAccount = require('./student-management-syste-c5674-firebase-adminsdk-fbsvc-a393842b32.json'); // <--- Your downloaded key file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;