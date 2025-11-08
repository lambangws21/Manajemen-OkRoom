// src/lib/authServices.ts
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type AuthError,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Inisialisasi Firebase Auth
export const auth = getAuth();

// Tipe umum untuk hasil auth
interface AuthResult {
  user: User | null;
  error: string | null;
}

/**
 * 🔹 Registrasi pengguna baru
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  role: string = "perawat"
): Promise<AuthResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role,
      createdAt: new Date().toISOString(),
    });

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    console.error("❌ Error signUpWithEmail:", authError.message);
    return { user: null, error: authError.message || "Gagal mendaftar" };
  }
}

/**
 * 🔹 Login dengan email & password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    console.error("❌ Error signInWithEmail:", authError.message);
    return { user: null, error: authError.message || "Gagal login" };
  }
}

/**
 * 🔹 Logout dari sesi aktif
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    console.error("❌ Error logout:", authError.message);
    throw new Error(authError.message || "Gagal logout");
  }
}

/**
 * 🔹 Pantau status login (realtime listener)
 */
export function listenToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
