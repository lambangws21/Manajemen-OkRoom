'use client';
import { useState, useEffect, useCallback } from 'react';
import { Firestore, collection, onSnapshot, doc, setDoc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Staff, NurseShiftTeams, ShiftAssignment, ShiftKey } from '../types/staffTypes';

const ASSIGNMENT_DOC_ID = 'active_assignment';
const STAFFS_COLLECTION = 'staffs';
const ASSIGNMENT_COLLECTION = 'assignments';

const INITIAL_NURSE_TEAMS: NurseShiftTeams = { Pagi: [], Siang: [], Malam: [] };

export const useAssignmentManager = (
  db: Firestore | null,
  isAuthReady: boolean,
  userId: string | null,
  getCollectionPath: (name: string) => string | null
) => {
  const [anesthesiaTeam, setAnesthesiaTeam] = useState<Staff[]>([]);
  const [nurseTeams, setNurseTeams] = useState<NurseShiftTeams>(INITIAL_NURSE_TEAMS);
  const [allStaffs, setAllStaffs] = useState<Staff[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapStaff = useCallback((doc: QueryDocumentSnapshot<DocumentData>): Staff => ({
    id: doc.id,
    ...(doc.data() as Omit<Staff, 'id'>),
  }), []);

  useEffect(() => {
    if (!db || !isAuthReady || !userId) return;
    const staffPath = getCollectionPath(STAFFS_COLLECTION);
    if (!staffPath) return;
    const unsub = onSnapshot(collection(db, staffPath), (snap) => {
      setAllStaffs(snap.docs.map(mapStaff));
    });
    return () => unsub();
  }, [db, isAuthReady, userId, mapStaff, getCollectionPath]);

  const saveAssignment = async (data: ShiftAssignment): Promise<boolean> => {
    if (!db || !userId) return false;
    setIsSaving(true);
    try {
      const path = getCollectionPath(ASSIGNMENT_COLLECTION);
      if (!path) throw new Error('Path tidak valid.');
      await setDoc(doc(db, path, ASSIGNMENT_DOC_ID), data, { merge: true });
      setIsSaving(false);
      return true;
    } catch (e) {
      console.error(e);
      setError('Gagal menyimpan penugasan.');
      setIsSaving(false);
      return false;
    }
  };

  return { anesthesiaTeam, nurseTeams, allStaffs, isLoading, error, setAnesthesiaTeam, setNurseTeams, saveAssignment, isSaving };
};
