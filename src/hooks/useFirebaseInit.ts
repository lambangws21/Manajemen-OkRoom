'use client';
import { useEffect, useState, useCallback } from 'react';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import { FirebaseInitResult } from '@/types/firebaseTypes';

declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config ? JSON.parse(__firebase_config) : {};

export const useFirebaseInit = (): FirebaseInitResult => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const getCollectionPath = useCallback((collectionName: string) => {
    if (!userId) return null;
    return `artifacts/${appId}/users/${userId}/${collectionName}`;
  }, [userId]);

  useEffect(() => {
    setLogLevel('error');
    try {
      let app: FirebaseApp;
      if (getApps().length === 0) app = initializeApp(firebaseConfig);
      else app = getApp();

      const db = getFirestore(app);
      const auth = getAuth(app);

      setDb(db);
      setAuth(auth);

      const authUser = async () => {
        try {
          if (__initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
          else await signInAnonymously(auth);
        } catch (e) {
          console.error('Firebase Auth Error:', e);
          setFirebaseError('Gagal mengautentikasi pengguna.');
        }
      };

      authUser();
      const unsub = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
        setUserId(user?.uid || crypto.randomUUID());
        setIsAuthReady(true);
      });
      return () => unsub();
    } catch (e) {
      console.error('Firebase Initialization Error:', e);
      setFirebaseError('Gagal menginisialisasi Firebase.');
      setIsAuthReady(true);
    }
  }, []);

  return { db, auth, userId, isAuthReady, firebaseError, getCollectionPath };
};
