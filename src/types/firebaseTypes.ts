import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

export interface FirebaseInitResult {
  db: Firestore | null;
  auth: Auth | null;
  userId: string | null;
  isAuthReady: boolean;
  firebaseError: string | null;
  getCollectionPath: (collectionName: string) => string | null;
}