import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5GPfQ-t68zN3i8MlfduXqR49I9LNwY8Y",
  authDomain: "solmate-e4c8f.firebaseapp.com",
  projectId: "solmate-e4c8f",
  storageBucket: "solmate-e4c8f.firebasestorage.app",
  messagingSenderId: "573616664483",
  appId: "1:573616664483:web:7792d36bab872ee0aa3416",
  measurementId: "G-R3H99X09LR",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
