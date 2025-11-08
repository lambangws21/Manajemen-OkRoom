// Import fungsi yang diperlukan dari Firebase SDK
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// TODO: Ganti dengan konfigurasi proyek Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyCwN90oQItu1fx88mFwR11zA6f_Egz8sgU",
    authDomain: "data-ok-b4091.firebaseapp.com",
    projectId: "data-ok-b4091",
    storageBucket: "data-ok-b4091.firebasestorage.app",
    messagingSenderId: "525002375108",
    appId: "1:525002375108:web:8f54dfaa2526b1e795ae91"
  };

// Inisialisasi Firebase
// Cek apakah aplikasi sudah diinisialisasi untuk menghindari error di Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app, "asia-southeast2"); // Pastikan region sama dengan di backend

export { db, auth, functions };
