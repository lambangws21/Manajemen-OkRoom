import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
// Import types from the single source of truth
import type { ScheduledSurgery, NewScheduledSurgery } from '@/types';

const scheduleCollection = collection(db, "scheduledSurgeries");

/**
 * Fetches all schedules from Firestore.
 */
export async function getSchedules(): Promise<ScheduledSurgery[]> {
  const q = query(scheduleCollection, orderBy("scheduledAt", "asc"));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Safely convert Firestore Timestamp to ISO Date string
      scheduledAt: (data.scheduledAt as Timestamp).toDate().toISOString(),
    } as ScheduledSurgery;
  });
}

/**
 * Adds a new schedule to Firestore.
 */
export async function createSchedule(schedule: NewScheduledSurgery): Promise<string> {
  const docRef = await addDoc(scheduleCollection, {
    ...schedule,
    // Convert ISO string back to Firestore Timestamp for proper querying
    scheduledAt: Timestamp.fromDate(new Date(schedule.scheduledAt)),
  });
  return docRef.id;
}

/**
 * Updates an existing schedule in Firestore.
 */
export async function updateSchedule(schedule: Partial<ScheduledSurgery> & { id: string }): Promise<void> {
  const { id, ...data } = schedule;
  const docRef = doc(db, "scheduledSurgeries", id);
  
  // Create a payload with a type that satisfies Firestore's updateDoc function
  const updatePayload: { [key: string]: unknown } = { ...data };

  // If the date is being updated, convert it back to a Timestamp
  if (data.scheduledAt) {
    updatePayload.scheduledAt = Timestamp.fromDate(new Date(data.scheduledAt));
  }

  // A targeted eslint-disable comment is used here as a pragmatic solution
  // for the complex and generic type signature of Firestore's updateDoc function.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(docRef, updatePayload as any);
}

/**
 * Deletes a schedule from Firestore.
 */
export async function deleteSchedule(id: string): Promise<void> {
  const docRef = doc(db, "scheduledSurgeries", id);
  await deleteDoc(docRef);
}

